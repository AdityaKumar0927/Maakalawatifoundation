import { generateRegistrationOptions } from "@simplewebauthn/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rpID } from "@/lib/env";
import { getAdminForRequest, hasValidOrigin } from "@/lib/guard";
import { hashToken } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { safeEqual, storeChallenge } from "@/lib/webauthn";
import { isAllowedAdminEmail } from "@/lib/admin-allowlist";

const RP_NAME = "Maa Kalawati Foundation";

const bodySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("setup"),
    email: z.string().trim().toLowerCase().pipe(z.string().email().max(200)),
    name: z.string().trim().min(2).max(100),
    token: z.string().min(8).max(200),
  }),
  z.object({
    mode: z.literal("invite"),
    token: z.string().min(8).max(200),
    name: z.string().trim().min(2).max(100),
  }),
  z.object({
    mode: z.literal("add"),
  }),
]);

export async function POST(request: Request): Promise<Response> {
  if (!hasValidOrigin(request)) {
    return Response.json({ error: "Bad origin" }, { status: 403 });
  }
  const limit = await rateLimit("webauthn-reg", 10, 3600);
  if (limit !== "ok") {
    return limit === "limited"
      ? Response.json({ error: "Too many attempts — wait a while" }, { status: 429 })
      : Response.json({ error: "Temporarily unavailable — try again shortly" }, { status: 503 });
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const body = parsed.data;

  let email: string;
  let name: string;
  let role: "OWNER" | "ADMIN" = "ADMIN";
  let inviteId: string | undefined;
  let existingUserId: string | undefined;

  if (body.mode === "setup") {
    // One-time bootstrap (or owner recovery) via the ADMIN_SETUP_TOKEN env.
    const expected = process.env.ADMIN_SETUP_TOKEN;
    if (!expected || expected.length < 16 || !safeEqual(body.token, expected)) {
      return Response.json({ error: "Invalid token" }, { status: 403 });
    }
    if (!isAllowedAdminEmail(body.email)) {
      return Response.json(
        { error: "This email is not authorised to administer this site" },
        { status: 403 }
      );
    }
    email = body.email;
    name = body.name;
    role = "OWNER";
  } else if (body.mode === "invite") {
    const invite = await prisma.adminInvite.findUnique({
      where: { tokenHash: hashToken(body.token) },
    });
    if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
      return Response.json({ error: "Invalid or expired invite" }, { status: 403 });
    }
    email = invite.email;
    name = body.name;
    role = invite.role;
    inviteId = invite.id;
  } else {
    // A signed-in admin adding another passkey to their own account.
    const user = await getAdminForRequest();
    if (!user) return Response.json({ error: "Not authorized" }, { status: 401 });
    email = user.email;
    name = user.name;
    role = user.role;
    existingUserId = user.id;
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email },
    include: { credentials: true },
  });

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: rpID(),
    userName: email,
    userDisplayName: name,
    attestationType: "none",
    excludeCredentials:
      existing?.credentials.map((c) => ({
        id: c.id,
        transports: c.transports
          ? (c.transports.split(",") as AuthenticatorTransport[])
          : undefined,
      })) ?? [],
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  await storeChallenge({
    challenge: options.challenge,
    purpose: "registration",
    email,
    name,
    role,
    inviteId,
    existingUserId,
  });

  // Never leak whether an email already exists beyond what the flow needs.
  return Response.json({ options }, { headers: { "Cache-Control": "no-store" } });
}
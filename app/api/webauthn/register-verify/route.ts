import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { appOrigin, rpID } from "@/lib/env";
import { hasValidOrigin } from "@/lib/guard";
import { createSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { consumeChallenge } from "@/lib/webauthn";
import { isAllowedAdminEmail } from "@/lib/admin-allowlist";

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

  const challenge = await consumeChallenge("registration");
  if (!challenge || !challenge.email || !challenge.name || !challenge.role) {
    return Response.json({ error: "Challenge expired — try again" }, { status: 400 });
  }
  if (!isAllowedAdminEmail(challenge.email)) {
    return Response.json(
      { error: "This email is not authorised to administer this site" },
      { status: 403 }
    );
  }

  let payload: { response: RegistrationResponseJSON; deviceName?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: payload.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: appOrigin(),
      expectedRPID: rpID(),
      requireUserVerification: false,
    });
  } catch {
    return Response.json({ error: "Verification failed" }, { status: 400 });
  }
  if (!verification.verified || !verification.registrationInfo) {
    return Response.json({ error: "Verification failed" }, { status: 400 });
  }
  const { credential } = verification.registrationInfo;

  const deviceName =
    typeof payload.deviceName === "string" && payload.deviceName.trim()
      ? payload.deviceName.trim().slice(0, 60)
      : "Passkey";

  // Re-validate the invite at verify time (it could have been used since).
  if (challenge.inviteId) {
    const invite = await prisma.adminInvite.findUnique({ where: { id: challenge.inviteId } });
    if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
      return Response.json({ error: "Invite no longer valid" }, { status: 403 });
    }
  }

  const user = await prisma.adminUser.upsert({
    where: { email: challenge.email },
    create: {
      email: challenge.email,
      name: challenge.name,
      role: challenge.role,
      active: true,
    },
    // An OWNER-issued invite explicitly grants its role (this is the only
    // promotion path); setup-token recovery and add-passkey never touch it.
    update: challenge.inviteId ? { role: challenge.role } : {},
  });

  if (!user.active) {
    return Response.json({ error: "Account is deactivated" }, { status: 403 });
  }

  await prisma.credential.create({
    data: {
      id: credential.id,
      userId: user.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports?.join(",") ?? "",
      deviceName,
    },
  });

  if (challenge.inviteId) {
    await prisma.adminInvite.update({
      where: { id: challenge.inviteId },
      data: { usedAt: new Date() },
    });
  }

  await createSession(user.id);
  const via = challenge.inviteId
    ? "via invite"
    : challenge.existingUserId
      ? "self-service"
      : "via SETUP TOKEN";
  await audit({
    actorEmail: user.email,
    action: "auth.passkey_enrolled",
    entity: "AdminUser",
    entityId: user.id,
    summary: `Passkey enrolled (${deviceName}, ${via}, role ${user.role})`,
  });

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
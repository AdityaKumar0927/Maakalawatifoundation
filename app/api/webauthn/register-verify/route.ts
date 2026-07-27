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

export async function POST(request: Request): Promise<Response> {
  if (!hasValidOrigin(request)) {
    return Response.json({ error: "Bad origin" }, { status: 403 });
  }
  if (!(await rateLimit("webauthn-reg", 10, 3600))) {
    return Response.json({ error: "Too many attempts" }, { status: 429 });
  }

  const challenge = await consumeChallenge("registration");
  if (!challenge || !challenge.email || !challenge.name || !challenge.role) {
    return Response.json({ error: "Challenge expired — try again" }, { status: 400 });
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
    // Existing account (owner recovery / added passkey): never touch role here.
    update: {},
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
  await audit({
    actorEmail: user.email,
    action: "auth.passkey_enrolled",
    entity: "AdminUser",
    entityId: user.id,
    summary: `Passkey enrolled (${deviceName})`,
  });

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
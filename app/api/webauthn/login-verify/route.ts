import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
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
  const limit = await rateLimit("webauthn-login", 20, 900);
  if (limit !== "ok") {
    return limit === "limited"
      ? Response.json({ error: "Too many attempts — wait a while" }, { status: 429 })
      : Response.json({ error: "Temporarily unavailable — try again shortly" }, { status: 503 });
  }

  const challenge = await consumeChallenge("authentication");
  if (!challenge) {
    return Response.json({ error: "Challenge expired — try again" }, { status: 400 });
  }

  let payload: { response: AuthenticationResponseJSON };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const credentialId = payload.response?.id;
  if (typeof credentialId !== "string" || !credentialId) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
    include: { user: true },
  });
  // Deliberately identical error for unknown credential vs inactive user.
  if (!credential || !credential.user.active) {
    return Response.json({ error: "Sign-in failed" }, { status: 401 });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: payload.response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: appOrigin(),
      expectedRPID: rpID(),
      credential: {
        id: credential.id,
        publicKey: new Uint8Array(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports
          ? (credential.transports.split(",") as AuthenticatorTransport[])
          : undefined,
      },
      requireUserVerification: false,
    });
  } catch {
    return Response.json({ error: "Sign-in failed" }, { status: 401 });
  }
  if (!verification.verified) {
    return Response.json({ error: "Sign-in failed" }, { status: 401 });
  }

  await prisma.credential.update({
    where: { id: credential.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date(),
    },
  });

  await createSession(credential.userId);
  await audit({
    actorEmail: credential.user.email,
    action: "auth.login",
    entity: "AdminUser",
    entityId: credential.userId,
    summary: `Signed in with passkey (${credential.deviceName})`,
  });

  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
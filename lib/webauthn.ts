import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requiredEnv } from "@/lib/env";

/**
 * WebAuthn challenge handling. The challenge issued with the options is
 * stored in a short-lived signed cookie (HS256, 5 minutes) so verification
 * is stateless and bound to the same browser.
 */

const CHALLENGE_COOKIE = "__Host-mkf_challenge";

function secretKey(): Uint8Array {
  return new TextEncoder().encode(requiredEnv("SESSION_SECRET"));
}

export type ChallengePurpose = "registration" | "authentication";

export type ChallengePayload = {
  challenge: string;
  purpose: ChallengePurpose;
  /** Registration only: who is being enrolled. */
  email?: string;
  name?: string;
  role?: "OWNER" | "ADMIN";
  /** Registration via invite: the invite row being consumed. */
  inviteId?: string;
  /** Registration for an already-signed-in admin adding a passkey. */
  existingUserId?: string;
};

export async function storeChallenge(payload: ChallengePayload): Promise<void> {
  const jwt = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secretKey());
  const jar = await cookies();
  jar.set(CHALLENGE_COOKIE, jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 300,
  });
}

/** Read and invalidate the stored challenge (single use). */
export async function consumeChallenge(
  purpose: ChallengePurpose
): Promise<ChallengePayload | null> {
  const jar = await cookies();
  const token = jar.get(CHALLENGE_COOKIE)?.value;
  jar.delete(CHALLENGE_COOKIE);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const data = payload as unknown as ChallengePayload;
    if (data.purpose !== purpose || typeof data.challenge !== "string") return null;
    return data;
  } catch {
    return null;
  }
}

/** Constant-time string comparison (for the one-time admin setup token). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

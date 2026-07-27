import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import type { AdminRole, AdminUser } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Session model: the browser holds a random 256-bit opaque token in a
 * __Host- cookie (Secure, HttpOnly, SameSite=Strict, Path=/). The database
 * stores only the SHA-256 hash, so neither a DB leak nor a log leak yields a
 * usable session. Sessions are revocable server-side.
 */

export const SESSION_COOKIE = "__Host-mkf_session";
const SESSION_TTL_HOURS = 12;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(token) },
      data: { revokedAt: new Date() },
    });
  }
  jar.delete(SESSION_COOKIE);
}

/** Revoke every session of a user (e.g. when deactivated or removed). */
export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Resolve the current admin user, or null. Cached per request.
 * Fails closed: any error means "not signed in".
 */
export const getSessionUser = cache(async (): Promise<AdminUser | null> => {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!session) return null;
    if (session.revokedAt || session.expiresAt < new Date()) return null;
    if (!session.user.active) return null;
    return session.user;
  } catch {
    return null;
  }
});

export function roleAtLeast(role: AdminRole, required: AdminRole): boolean {
  if (required === "ADMIN") return role === "ADMIN" || role === "OWNER";
  return role === "OWNER";
}

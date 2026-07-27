import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Fixed-window rate limiting backed by Postgres — no extra infrastructure.
 * Keys are salted hashes of the client IP (DPDP data minimisation: raw IPs
 * are never persisted).
 */

async function clientIp(): Promise<string> {
  const h = await headers();
  // On Vercel, x-forwarded-for is set by the platform and the first entry is
  // the real client address.
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? "unknown";
}

export async function rateLimitKey(scope: string): Promise<string> {
  const ip = await clientIp();
  const salt = process.env.RATE_LIMIT_SALT ?? "mkf-default-salt";
  const digest = createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
  return `${scope}:${digest}`;
}

export type RateLimitResult = "ok" | "limited" | "unavailable";

/**
 * Consume one hit from the bucket. Fails CLOSED when the database is
 * unreachable — but reports that as "unavailable" so callers can show an
 * honest error instead of a bogus "too many requests".
 */
export async function rateLimit(
  scope: string,
  max: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = await rateLimitKey(scope);
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  try {
    const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });
    if (!bucket || bucket.resetAt < now) {
      await prisma.rateLimitBucket.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return "ok";
    }
    if (bucket.count >= max) return "limited";
    await prisma.rateLimitBucket.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return "ok";
  } catch {
    return "unavailable";
  }
}

import "server-only";
import { redirect } from "next/navigation";
import type { AdminRole, AdminUser } from "@prisma/client";
import { getSessionUser, roleAtLeast } from "@/lib/session";
import { appOrigin } from "@/lib/env";

/**
 * Centralised authorization. Every admin page, server action and admin route
 * handler calls one of these — deny by default, no scattered role checks.
 */

/** For pages/layouts: redirect to the login screen when not authorized. */
export async function requireAdminPage(required: AdminRole = "ADMIN"): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!roleAtLeast(user.role, required)) redirect("/admin");
  return user;
}

/** For server actions: throw when not authorized (fails closed). */
export async function requireAdminAction(required: AdminRole = "ADMIN"): Promise<AdminUser> {
  const user = await getSessionUser();
  if (!user || !roleAtLeast(user.role, required)) {
    throw new Error("Not authorized");
  }
  return user;
}

/** For route handlers: return the user or null; caller must 401 on null. */
export async function getAdminForRequest(required: AdminRole = "ADMIN"): Promise<AdminUser | null> {
  const user = await getSessionUser();
  if (!user || !roleAtLeast(user.role, required)) return null;
  return user;
}

/**
 * CSRF defence for route handlers that mutate state: the request must carry
 * an Origin (or Referer) matching our canonical origin. Server actions get
 * this check from Next.js itself; route handlers must call this explicitly.
 */
export function hasValidOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const expected = appOrigin();
  if (origin) return origin === expected;
  if (referer) {
    try {
      return new URL(referer).origin === expected;
    } catch {
      return false;
    }
  }
  return false;
}

export function forbidden(): Response {
  return Response.json({ error: "Not authorized" }, { status: 401 });
}

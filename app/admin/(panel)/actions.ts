"use server";

import { redirect } from "next/navigation";
import { destroySession, getSessionUser } from "@/lib/session";
import { audit } from "@/lib/audit";

export async function signOut(): Promise<void> {
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    await audit({
      actorEmail: user.email,
      action: "auth.logout",
      entity: "AdminUser",
      entityId: user.id,
    });
  }
  redirect("/admin/login");
}
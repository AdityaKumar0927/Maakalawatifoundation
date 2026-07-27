"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { hashToken, revokeAllSessions } from "@/lib/session";

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email().max(200)),
  role: z.enum(["ADMIN", "OWNER"]),
});

export async function createInvite(formData: FormData): Promise<void> {
  const owner = await requireAdminAction("OWNER");
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/admins?error=invite");
  const { email, role } = parsed.data;

  const token = randomBytes(24).toString("base64url");
  await prisma.adminInvite.create({
    data: {
      tokenHash: hashToken(token),
      email,
      role,
      createdById: owner.id,
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000),
    },
  });
  await audit({
    actorEmail: owner.email,
    action: "admin.invite",
    entity: "AdminInvite",
    summary: `Invited ${email} as ${role} (72h)`,
  });
  // The token appears once, in the URL of the confirmation screen, so the
  // owner can copy the full invite link. Only its hash is stored.
  redirect(`/admin/admins?invite=${token}`);
}

export async function deleteInvite(formData: FormData): Promise<void> {
  const owner = await requireAdminAction("OWNER");
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.adminInvite.delete({ where: { id } }).catch(() => {});
    await audit({
      actorEmail: owner.email,
      action: "admin.invite_revoke",
      entity: "AdminInvite",
      entityId: id,
    });
  }
  redirect("/admin/admins?saved=1");
}

export async function setUserActive(formData: FormData): Promise<void> {
  const owner = await requireAdminAction("OWNER");
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active")) === "true";
  if (!id || id === owner.id) redirect("/admin/admins?error=self");

  await prisma.adminUser.update({ where: { id }, data: { active } });
  if (!active) await revokeAllSessions(id);
  await audit({
    actorEmail: owner.email,
    action: active ? "admin.reactivate" : "admin.deactivate",
    entity: "AdminUser",
    entityId: id,
    summary: active ? "" : "All sessions revoked",
  });
  redirect("/admin/admins?saved=1");
}

export async function deleteCredential(formData: FormData): Promise<void> {
  const owner = await requireAdminAction("OWNER");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/admins?saved=1");

  const credential = await prisma.credential.findUnique({ where: { id } });
  if (credential) {
    // Never remove the owner's own last passkey — that locks them out.
    if (credential.userId === owner.id) {
      const count = await prisma.credential.count({ where: { userId: owner.id } });
      if (count <= 1) redirect("/admin/admins?error=last-key");
    }
    await prisma.credential.delete({ where: { id } });
    await audit({
      actorEmail: owner.email,
      action: "admin.credential_delete",
      entity: "Credential",
      entityId: id,
      summary: `Removed passkey "${credential.deviceName}"`,
    });
  }
  redirect("/admin/admins?saved=1");
}
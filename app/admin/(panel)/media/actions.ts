"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { mediaSlotKeySet } from "@/lib/media";
import { cleanText } from "@/lib/validation";
import { UploadError, deleteImage, uploadImage } from "@/lib/upload";

export async function saveMediaSlot(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const slot = String(formData.get("slot") ?? "");
  if (!mediaSlotKeySet.has(slot)) redirect("/admin/media?error=Unknown+slot");

  const alt = cleanText(String(formData.get("alt") ?? "")).slice(0, 200);
  const file = formData.get("file");
  const existing = await prisma.mediaSlot.findUnique({ where: { key: slot } });

  try {
    if (file instanceof File && file.size > 0) {
      const url = await uploadImage(file, slot);
      await prisma.mediaSlot.upsert({
        where: { key: slot },
        create: { key: slot, url, alt },
        update: { url, alt },
      });
      await deleteImage(existing?.url);
      await audit({
        actorEmail: user.email,
        action: "media.upload",
        entity: "MediaSlot",
        entityId: slot,
      });
    } else if (existing) {
      await prisma.mediaSlot.update({ where: { key: slot }, data: { alt } });
    }
  } catch (e) {
    const message = e instanceof UploadError ? e.message : "Upload failed.";
    redirect(`/admin/media?error=${encodeURIComponent(message)}`);
  }
  redirect("/admin/media?saved=1");
}

export async function removeMediaSlot(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const slot = String(formData.get("slot") ?? "");
  if (!mediaSlotKeySet.has(slot)) redirect("/admin/media?error=Unknown+slot");

  const existing = await prisma.mediaSlot.findUnique({ where: { key: slot } });
  if (existing) {
    await prisma.mediaSlot.delete({ where: { key: slot } });
    await deleteImage(existing.url);
    await audit({
      actorEmail: user.email,
      action: "media.remove",
      entity: "MediaSlot",
      entityId: slot,
    });
  }
  redirect("/admin/media?saved=1");
}
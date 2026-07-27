"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { optionalText, text } from "@/lib/validation";
import { parseISTDateTime } from "@/lib/utils";

const announcementSchema = z.object({
  id: z.string().max(50).optional().default(""),
  titleEn: text(150),
  titleHi: text(150),
  bodyEn: optionalText(500),
  bodyHi: optionalText(500),
  active: z.string().optional().default(""),
  startsAt: z.string().optional().default(""),
  endsAt: z.string().optional().default(""),
});

export async function saveAnnouncement(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const parsed = announcementSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/announcements?error=1");
  const d = parsed.data;

  const data = {
    titleEn: d.titleEn,
    titleHi: d.titleHi,
    bodyEn: d.bodyEn,
    bodyHi: d.bodyHi,
    active: d.active === "on",
    startsAt: parseISTDateTime(d.startsAt) ?? new Date(),
    // Hide *after* the chosen day: extend to end of day IST.
    endsAt: (() => {
      const end = parseISTDateTime(d.endsAt);
      return end ? new Date(end.getTime() + (24 * 3600 - 1) * 1000) : null;
    })(),
  };

  if (d.id) {
    await prisma.announcement.update({ where: { id: d.id }, data });
  } else {
    await prisma.announcement.create({ data });
  }
  await audit({
    actorEmail: user.email,
    action: d.id ? "announcement.update" : "announcement.create",
    entity: "Announcement",
    entityId: d.id || "new",
    summary: d.titleEn,
  });
  redirect("/admin/announcements?saved=1");
}

export async function deleteAnnouncement(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.announcement.delete({ where: { id } }).catch(() => {});
    await audit({
      actorEmail: user.email,
      action: "announcement.delete",
      entity: "Announcement",
      entityId: id,
    });
  }
  redirect("/admin/announcements?saved=1");
}
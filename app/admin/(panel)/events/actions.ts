"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { optionalText, slugSchema, text } from "@/lib/validation";
import { parseISTDateTime, slugify } from "@/lib/utils";
import { UploadError, deleteImage, uploadImage } from "@/lib/upload";

const eventSchema = z.object({
  id: z.string().max(50).optional().default(""),
  slug: z.string().max(100).optional().default(""),
  titleEn: text(150),
  titleHi: text(150),
  summaryEn: optionalText(300),
  summaryHi: optionalText(300),
  bodyEn: optionalText(5000),
  bodyHi: optionalText(5000),
  locationEn: optionalText(150),
  locationHi: optionalText(150),
  startAt: z.string().min(1),
  endAt: z.string().optional().default(""),
  imageAlt: optionalText(200),
  published: z.string().optional().default(""),
  removeImage: z.string().optional().default(""),
});

export async function saveEvent(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const parsed = eventSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/events?error=fields");
  const d = parsed.data;

  const startAt = parseISTDateTime(d.startAt);
  if (!startAt) redirect("/admin/events?error=fields");
  const endAt = parseISTDateTime(d.endAt);

  let slug = d.slug ? d.slug : slugify(d.titleEn);
  const slugCheck = slugSchema.safeParse(slug);
  if (!slugCheck.success) redirect("/admin/events?error=slug");
  slug = slugCheck.data;

  const existing = d.id
    ? await prisma.event.findUnique({ where: { id: d.id } })
    : null;
  if (d.id && !existing) redirect("/admin/events?error=missing");

  let imageUrl = existing?.imageUrl ?? null;
  const file = formData.get("image");
  try {
    if (file instanceof File && file.size > 0) {
      const newUrl = await uploadImage(file, "events");
      await deleteImage(imageUrl);
      imageUrl = newUrl;
    } else if (d.removeImage === "on" && imageUrl) {
      await deleteImage(imageUrl);
      imageUrl = null;
    }
  } catch (e) {
    const message = e instanceof UploadError ? e.message : "Upload failed";
    redirect(`/admin/events?error=${encodeURIComponent(message)}`);
  }

  const data = {
    slug,
    titleEn: d.titleEn,
    titleHi: d.titleHi,
    summaryEn: d.summaryEn,
    summaryHi: d.summaryHi,
    bodyEn: d.bodyEn,
    bodyHi: d.bodyHi,
    locationEn: d.locationEn,
    locationHi: d.locationHi,
    startAt,
    endAt,
    imageUrl,
    imageAlt: d.imageAlt,
    published: d.published === "on",
  };

  try {
    if (existing) {
      await prisma.event.update({ where: { id: existing.id }, data });
    } else {
      await prisma.event.create({ data });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect("/admin/events?error=slug-taken");
    }
    throw e;
  }

  await audit({
    actorEmail: user.email,
    action: existing ? "event.update" : "event.create",
    entity: "Event",
    entityId: existing?.id ?? slug,
    summary: d.titleEn,
  });
  redirect("/admin/events?saved=1");
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const existing = await prisma.event.findUnique({ where: { id } });
    if (existing) {
      await prisma.event.delete({ where: { id } });
      await deleteImage(existing.imageUrl);
      await audit({
        actorEmail: user.email,
        action: "event.delete",
        entity: "Event",
        entityId: id,
        summary: existing.titleEn,
      });
    }
  }
  redirect("/admin/events?saved=1");
}
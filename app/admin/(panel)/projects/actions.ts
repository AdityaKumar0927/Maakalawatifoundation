"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { optionalText, slugSchema, text } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { UploadError, deleteImage, uploadImage } from "@/lib/upload";

const projectSchema = z.object({
  id: z.string().max(50).optional().default(""),
  slug: z.string().max(100).optional().default(""),
  category: z.enum(["HEALTHCARE", "EDUCATION", "WOMEN_EMPOWERMENT", "COMMUNITY_WELFARE"]),
  titleEn: text(150),
  titleHi: text(150),
  summaryEn: optionalText(300),
  summaryHi: optionalText(300),
  bodyEn: optionalText(8000),
  bodyHi: optionalText(8000),
  imageAlt: optionalText(200),
  featured: z.string().optional().default(""),
  published: z.string().optional().default(""),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  removeImage: z.string().optional().default(""),
});

export async function saveProject(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const parsed = projectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/projects?error=fields");
  const d = parsed.data;

  let slug = d.slug ? d.slug : slugify(d.titleEn);
  const slugCheck = slugSchema.safeParse(slug);
  if (!slugCheck.success) redirect("/admin/projects?error=slug");
  slug = slugCheck.data;

  const existing = d.id ? await prisma.project.findUnique({ where: { id: d.id } }) : null;
  if (d.id && !existing) redirect("/admin/projects?error=missing");

  let imageUrl = existing?.imageUrl ?? null;
  const file = formData.get("image");
  try {
    if (file instanceof File && file.size > 0) {
      const newUrl = await uploadImage(file, "projects");
      await deleteImage(imageUrl);
      imageUrl = newUrl;
    } else if (d.removeImage === "on" && imageUrl) {
      await deleteImage(imageUrl);
      imageUrl = null;
    }
  } catch (e) {
    const message = e instanceof UploadError ? e.message : "Upload failed";
    redirect(`/admin/projects?error=${encodeURIComponent(message)}`);
  }

  const data = {
    slug,
    category: d.category,
    titleEn: d.titleEn,
    titleHi: d.titleHi,
    summaryEn: d.summaryEn,
    summaryHi: d.summaryHi,
    bodyEn: d.bodyEn,
    bodyHi: d.bodyHi,
    imageUrl,
    imageAlt: d.imageAlt,
    featured: d.featured === "on",
    published: d.published === "on",
    sortOrder: d.sortOrder,
  };

  try {
    if (existing) {
      await prisma.project.update({ where: { id: existing.id }, data });
    } else {
      await prisma.project.create({ data });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      redirect("/admin/projects?error=slug-taken");
    }
    throw e;
  }

  await audit({
    actorEmail: user.email,
    action: existing ? "project.update" : "project.create",
    entity: "Project",
    entityId: existing?.id ?? slug,
    summary: d.titleEn,
  });
  redirect("/admin/projects?saved=1");
}

export async function deleteProject(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (existing) {
      await prisma.project.delete({ where: { id } });
      await deleteImage(existing.imageUrl);
      await audit({
        actorEmail: user.email,
        action: "project.delete",
        entity: "Project",
        entityId: id,
        summary: existing.titleEn,
      });
    }
  }
  redirect("/admin/projects?saved=1");
}
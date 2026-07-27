"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { cleanText } from "@/lib/validation";
import { parseISTDateTime } from "@/lib/utils";
import { UploadError, deleteImage, uploadImage } from "@/lib/upload";

const rowSchema = z.object({
  visitDate: z.string().min(1),
  name: z.string().transform(cleanText).pipe(z.string().min(1).max(100)),
  phone: z.string().max(20).optional().default(""),
  address: z.string().transform(cleanText).pipe(z.string().max(300)).optional().default(""),
  purpose: z.string().transform(cleanText).pipe(z.string().max(300)).optional().default(""),
  notes: z.string().transform(cleanText).pipe(z.string().max(500)).optional().default(""),
});

const rowsSchema = z.array(rowSchema).min(1).max(50);

export async function saveVisitorRecords(formData: FormData): Promise<void> {
  const user = await requireAdminAction();

  let rowsRaw: unknown;
  try {
    rowsRaw = JSON.parse(String(formData.get("rows") ?? "[]"));
  } catch {
    redirect("/admin/visitors/new?error=rows");
  }
  const parsed = rowsSchema.safeParse(rowsRaw);
  if (!parsed.success) redirect("/admin/visitors/new?error=rows");

  let sourceImageUrl: string | null = null;
  const file = formData.get("sourceImage");
  if (file instanceof File && file.size > 0) {
    try {
      sourceImageUrl = await uploadImage(file, "visitor-book");
    } catch (e) {
      const message = e instanceof UploadError ? e.message : "Upload failed";
      redirect(`/admin/visitors/new?error=${encodeURIComponent(message)}`);
    }
  }

  const records = [];
  for (const row of parsed.data) {
    const visitDate = parseISTDateTime(row.visitDate);
    if (!visitDate) redirect("/admin/visitors/new?error=rows");
    records.push({
      visitDate,
      name: row.name,
      phone: row.phone.replace(/[^+\d\s-]/g, "").slice(0, 20),
      address: row.address,
      purpose: row.purpose,
      notes: row.notes,
      sourceImageUrl,
      createdById: user.id,
    });
  }

  await prisma.visitorRecord.createMany({ data: records });
  await audit({
    actorEmail: user.email,
    action: "visitor.digitise",
    entity: "VisitorRecord",
    summary: `Added ${records.length} visitor record(s)${sourceImageUrl ? " with source page photo" : ""}`,
  });
  redirect("/admin/visitors?saved=1");
}

export async function deleteVisitorRecord(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const record = await prisma.visitorRecord.findUnique({ where: { id } });
    if (record) {
      await prisma.visitorRecord.delete({ where: { id } });
      // Records digitised from the same page share one photo — remove the
      // blob only when no other record still references it.
      if (record.sourceImageUrl) {
        const stillUsed = await prisma.visitorRecord.count({
          where: { sourceImageUrl: record.sourceImageUrl },
        });
        if (stillUsed === 0) await deleteImage(record.sourceImageUrl);
      }
      await audit({
        actorEmail: user.email,
        action: "visitor.delete",
        entity: "VisitorRecord",
        entityId: id,
      });
    }
  }
  redirect("/admin/visitors?saved=1");
}
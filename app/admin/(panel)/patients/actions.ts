"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { optionalText } from "@/lib/validation";

const updateSchema = z.object({
  id: z.string().min(1).max(50),
  status: z.enum(["NEW", "CONTACTED", "SCHEDULED", "SUPPORTED", "CLOSED"]),
  notes: optionalText(3000),
});

export async function updatePatient(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/patients?error=1");
  const d = parsed.data;

  await prisma.patientRegistration.update({
    where: { id: d.id },
    data: { status: d.status, notes: d.notes },
  });
  await audit({
    actorEmail: user.email,
    action: "patient.update",
    entity: "PatientRegistration",
    entityId: d.id,
    summary: `Status → ${d.status}`,
  });
  redirect(`/admin/patients/${d.id}?saved=1`);
}

/**
 * DPDP erasure: permanently delete a patient record (e.g. on a data
 * principal's valid erasure request, or per the retention schedule).
 */
export async function deletePatient(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.patientRegistration.delete({ where: { id } }).catch(() => {});
    await audit({
      actorEmail: user.email,
      action: "patient.erase",
      entity: "PatientRegistration",
      entityId: id,
      summary: "Record permanently erased (DPDP erasure/retention)",
    });
  }
  redirect("/admin/patients?saved=1");
}
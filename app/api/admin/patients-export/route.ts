import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { forbidden, getAdminForRequest } from "@/lib/guard";

function csvCell(value: string): string {
  // Neutralise CSV formula injection and quote correctly.
  const safe = /^[=+\-@\t]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET(): Promise<Response> {
  const user = await getAdminForRequest();
  if (!user) return forbidden();

  const rows = await prisma.patientRegistration.findMany({
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "created",
    "status",
    "full_name",
    "age",
    "gender",
    "phone",
    "city",
    "address",
    "need",
    "preferred_language",
    "guardian_name",
    "guardian_relation",
    "guardian_phone",
    "consent_at",
    "consent_version",
    "consent_language",
    "notes",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.createdAt.toISOString(),
        r.status,
        r.fullName,
        String(r.age),
        r.gender,
        r.phone,
        r.city,
        r.address,
        r.need,
        r.preferredLanguage,
        r.guardianName ?? "",
        r.guardianRelation ?? "",
        r.guardianPhone ?? "",
        r.consentAt.toISOString(),
        r.consentVersion,
        r.consentLanguage,
        r.notes,
      ]
        .map(csvCell)
        .join(",")
    );
  }

  await audit({
    actorEmail: user.email,
    action: "patient.export",
    entity: "PatientRegistration",
    summary: `Exported ${rows.length} records (CSV)`,
  });

  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="patient-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
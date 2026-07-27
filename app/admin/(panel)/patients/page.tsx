import Link from "next/link";
import type { PatientStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { formatDateShort } from "@/lib/utils";
import { AdminPage, Card, EmptyState, SavedBanner } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Patients" };

const STATUSES: Array<{ key: PatientStatus | "ALL"; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "SUPPORTED", label: "Supported" },
  { key: "CLOSED", label: "Closed" },
];

const STATUS_STYLE: Record<PatientStatus, string> = {
  NEW: "bg-saffron-100 text-saffron-800",
  CONTACTED: "bg-cream-200 text-ink-soft",
  SCHEDULED: "bg-forest-100 text-forest-800",
  SUPPORTED: "bg-forest-600 text-white",
  CLOSED: "bg-cream-200 text-ink-faint",
};

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; saved?: string }>;
}) {
  await requireAdminPage();
  const { status, saved } = await searchParams;
  const filter = STATUSES.some((s) => s.key === status) && status !== "ALL"
    ? (status as PatientStatus)
    : null;

  const patients = await prisma.patientRegistration.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminPage
      title="Patient requests"
      action={
        <a
          href="/api/admin/patients-export"
          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Export CSV
        </a>
      }
    >
      {saved && <SavedBanner message="Done." />}

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.key}
            href={s.key === "ALL" ? "/admin/patients" : `/admin/patients?status=${s.key}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              (filter ?? "ALL") === s.key
                ? "bg-ink text-cream-50"
                : "border border-line bg-white text-ink-soft hover:text-ink"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {patients.length === 0 ? (
        <EmptyState>No patient requests{filter ? ` with status ${filter}` : ""} yet.</EmptyState>
      ) : (
        <div className="space-y-3">
          {patients.map((p) => (
            <Link key={p.id} href={`/admin/patients/${p.id}`} className="block">
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {p.fullName}
                    <span className="ml-2 text-sm font-normal text-ink-faint">
                      {p.age} · {p.gender} · {p.city || "—"}
                    </span>
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{p.need}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-ink-faint">{formatDateShort(p.createdAt, "en")}</span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      STATUS_STYLE[p.status]
                    )}
                  >
                    {p.status}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
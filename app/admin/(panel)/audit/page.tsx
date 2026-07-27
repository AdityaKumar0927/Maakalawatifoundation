import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { AdminPage, Card, EmptyState } from "@/components/admin/ui";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  await requireAdminPage();
  const entries = await prisma.auditLog.findMany({
    orderBy: { at: "desc" },
    take: 300,
  });

  return (
    <AdminPage title="Audit log">
      <p className="mb-5 max-w-2xl text-sm text-ink-soft">
        Append-only record of security-relevant actions (sign-ins, edits, exports, erasures).
        Nothing in the application can modify or delete these entries.
      </p>

      {entries.length === 0 ? (
        <EmptyState>No entries yet.</EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-ink-faint uppercase">
                <th className="px-4 py-3 font-semibold">When (IST)</th>
                <th className="px-4 py-3 font-semibold">Who</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-line/60 align-top">
                  <td className="px-4 py-2.5 whitespace-nowrap text-ink-faint">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    }).format(e.at)}
                  </td>
                  <td className="px-4 py-2.5 text-ink">{e.actorEmail}</td>
                  <td className="px-4 py-2.5">
                    <code className="rounded bg-cream-100 px-1.5 py-0.5 text-xs">{e.action}</code>
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {e.summary || `${e.entity}${e.entityId ? ` · ${e.entityId}` : ""}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AdminPage>
  );
}
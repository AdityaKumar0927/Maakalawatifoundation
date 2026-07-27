import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { formatDateShort } from "@/lib/utils";
import {
  AdminPage,
  Card,
  EmptyState,
  PrimaryLink,
  SavedBanner,
  inputCls,
} from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/buttons";
import { deleteVisitorRecord } from "@/app/admin/(panel)/visitors/actions";

export const metadata = { title: "Visitor book" };

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; q?: string }>;
}) {
  await requireAdminPage();
  const { saved, q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);

  const records = await prisma.visitorRecord.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
            { purpose: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { visitDate: "desc" },
    take: 200,
  });

  return (
    <AdminPage
      title="Visitor book"
      action={<PrimaryLink href="/admin/visitors/new">+ Digitise a page</PrimaryLink>}
    >
      {saved && <SavedBanner message="Done." />}

      <form className="mb-5 flex gap-2" action="/admin/visitors" method="get">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search name, phone or purpose…"
          className={`${inputCls} mt-0 max-w-sm`}
        />
        <button className="rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink-soft hover:text-ink">
          Search
        </button>
      </form>

      {records.length === 0 ? (
        <EmptyState>
          {query ? "No entries match that search." : "No visitor records yet — digitise the first page."}
        </EmptyState>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {r.name}
                  {r.phone && <span className="ml-2 text-sm font-normal text-ink-faint">{r.phone}</span>}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {formatDateShort(r.visitDate, "en")}
                  {r.purpose && <> · {r.purpose}</>}
                  {r.address && <> · {r.address}</>}
                </p>
                {r.notes && <p className="mt-0.5 text-xs text-ink-faint">{r.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                {r.sourceImageUrl && (
                  <Link
                    href={r.sourceImageUrl}
                    target="_blank"
                    className="text-xs font-semibold text-saffron-700 hover:underline"
                  >
                    Page photo ↗
                  </Link>
                )}
                <form action={deleteVisitorRecord}>
                  <input type="hidden" name="id" value={r.id} />
                  <ConfirmSubmit message={`Delete the record of ${r.name}?`}>Delete</ConfirmSubmit>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
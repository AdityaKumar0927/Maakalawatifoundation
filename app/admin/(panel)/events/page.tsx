import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { formatDateTime } from "@/lib/utils";
import {
  AdminPage,
  Card,
  EmptyState,
  ErrorBanner,
  PrimaryLink,
  SavedBanner,
} from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/buttons";
import { deleteEvent } from "@/app/admin/(panel)/events/actions";

export const metadata = { title: "Events" };

const ERRORS: Record<string, string> = {
  fields: "Please check the event fields and try again.",
  slug: "The web address (slug) must be lowercase words separated by dashes.",
  "slug-taken": "Another event already uses that web address — pick a different slug.",
  missing: "That event no longer exists.",
};

function describeError(error: string): string {
  if (ERRORS[error]) return ERRORS[error];
  try {
    return decodeURIComponent(error);
  } catch {
    return error;
  }
}

export default async function EventsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdminPage();
  const { saved, error } = await searchParams;
  const events = await prisma.event.findMany({ orderBy: { startAt: "desc" } });

  return (
    <AdminPage title="Events" action={<PrimaryLink href="/admin/events/new">+ New event</PrimaryLink>}>
      {saved && <SavedBanner message="Event saved." />}
      {error && <ErrorBanner message={describeError(error)} />}

      {events.length === 0 ? (
        <EmptyState>No events yet — create the first one.</EmptyState>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink">
                  {event.titleEn}
                  {!event.published && (
                    <span className="ml-2 rounded-full bg-cream-200 px-2 py-0.5 text-xs font-medium text-ink-faint">
                      Draft
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-ink-faint">
                  {formatDateTime(event.startAt, "en")} · /{event.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink"
                >
                  Edit
                </Link>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={event.id} />
                  <ConfirmSubmit message={`Delete event "${event.titleEn}"?`}>Delete</ConfirmSubmit>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
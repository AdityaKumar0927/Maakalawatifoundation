import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { toDateInputValue } from "@/lib/utils";
import {
  AdminPage,
  Card,
  EmptyState,
  ErrorBanner,
  Label,
  SavedBanner,
  inputCls,
} from "@/components/admin/ui";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/buttons";
import {
  deleteAnnouncement,
  saveAnnouncement,
} from "@/app/admin/(panel)/announcements/actions";
import type { Announcement } from "@prisma/client";

export const metadata = { title: "Announcements" };

function AnnouncementForm({ item }: { item?: Announcement }) {
  return (
    <form action={saveAnnouncement} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor={`titleEn-${item?.id ?? "new"}`}>Title — English</Label>
          <input
            id={`titleEn-${item?.id ?? "new"}`}
            name="titleEn"
            required
            maxLength={150}
            defaultValue={item?.titleEn}
            className={inputCls}
          />
        </div>
        <div>
          <Label htmlFor={`titleHi-${item?.id ?? "new"}`}>Title — हिन्दी</Label>
          <input
            id={`titleHi-${item?.id ?? "new"}`}
            name="titleHi"
            required
            lang="hi"
            maxLength={150}
            defaultValue={item?.titleHi}
            className={inputCls}
          />
        </div>
        <div>
          <Label htmlFor={`bodyEn-${item?.id ?? "new"}`} optional>
            Details — English
          </Label>
          <textarea
            id={`bodyEn-${item?.id ?? "new"}`}
            name="bodyEn"
            rows={2}
            maxLength={500}
            defaultValue={item?.bodyEn}
            className={inputCls}
          />
        </div>
        <div>
          <Label htmlFor={`bodyHi-${item?.id ?? "new"}`} optional>
            Details — हिन्दी
          </Label>
          <textarea
            id={`bodyHi-${item?.id ?? "new"}`}
            name="bodyHi"
            rows={2}
            lang="hi"
            maxLength={500}
            defaultValue={item?.bodyHi}
            className={inputCls}
          />
        </div>
        <div>
          <Label htmlFor={`startsAt-${item?.id ?? "new"}`}>Show from</Label>
          <input
            id={`startsAt-${item?.id ?? "new"}`}
            name="startsAt"
            type="date"
            defaultValue={item ? toDateInputValue(item.startsAt) : toDateInputValue(new Date())}
            className={inputCls}
          />
        </div>
        <div>
          <Label htmlFor={`endsAt-${item?.id ?? "new"}`} optional>
            Hide after
          </Label>
          <input
            id={`endsAt-${item?.id ?? "new"}`}
            name="endsAt"
            type="date"
            defaultValue={item?.endsAt ? toDateInputValue(item.endsAt) : ""}
            className={inputCls}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="active"
          defaultChecked={item ? item.active : true}
          className="h-4 w-4 accent-saffron-600"
        />
        Visible on the site
      </label>
      <SubmitButton>{item ? "Save changes" : "Add announcement"}</SubmitButton>
    </form>
  );
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdminPage();
  const { saved, error } = await searchParams;
  const items = await prisma.announcement.findMany({ orderBy: { startsAt: "desc" } });

  return (
    <AdminPage title="Announcements">
      {saved && <SavedBanner message="Announcement saved." />}
      {error && <ErrorBanner message="Please check the announcement fields and try again." />}
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        The most recent visible announcement appears in the bar at the top of every public page.
      </p>

      <Card>
        <h2 className="font-display text-xl text-ink">New announcement</h2>
        <div className="mt-4">
          <AnnouncementForm />
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {items.length === 0 && <EmptyState>No announcements yet.</EmptyState>}
        {items.map((item) => (
          <Card key={item.id}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                {item.active ? (
                  <span className="text-forest-700">● Visible</span>
                ) : (
                  <span className="text-ink-faint">○ Hidden</span>
                )}
              </p>
              <form action={deleteAnnouncement}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmSubmit message={`Delete announcement "${item.titleEn}"?`}>
                  Delete
                </ConfirmSubmit>
              </form>
            </div>
            <AnnouncementForm item={item} />
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
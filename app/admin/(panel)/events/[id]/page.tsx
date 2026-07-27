import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { toDateTimeInputValue } from "@/lib/utils";
import { AdminPage, Card, Label, inputCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { saveEvent } from "@/app/admin/(panel)/events/actions";

export const metadata = { title: "Edit event" };

export default async function EventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const event =
    id === "new" ? null : await prisma.event.findUnique({ where: { id } });
  if (id !== "new" && !event) notFound();

  return (
    <AdminPage title={event ? `Edit: ${event.titleEn}` : "New event"}>
      <Card>
        <form action={saveEvent} className="space-y-5">
          {event && <input type="hidden" name="id" value={event.id} />}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="titleEn">Title — English</Label>
              <input id="titleEn" name="titleEn" required maxLength={150} defaultValue={event?.titleEn} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="titleHi">Title — हिन्दी</Label>
              <input id="titleHi" name="titleHi" required lang="hi" maxLength={150} defaultValue={event?.titleHi} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="summaryEn" optional>Short summary — English</Label>
              <textarea id="summaryEn" name="summaryEn" rows={2} maxLength={300} defaultValue={event?.summaryEn} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="summaryHi" optional>Short summary — हिन्दी</Label>
              <textarea id="summaryHi" name="summaryHi" rows={2} lang="hi" maxLength={300} defaultValue={event?.summaryHi} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="bodyEn" optional>Full details — English</Label>
              <textarea id="bodyEn" name="bodyEn" rows={6} maxLength={5000} defaultValue={event?.bodyEn} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="bodyHi" optional>Full details — हिन्दी</Label>
              <textarea id="bodyHi" name="bodyHi" rows={6} lang="hi" maxLength={5000} defaultValue={event?.bodyHi} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="locationEn" optional>Location — English</Label>
              <input id="locationEn" name="locationEn" maxLength={150} defaultValue={event?.locationEn} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="locationHi" optional>Location — हिन्दी</Label>
              <input id="locationHi" name="locationHi" lang="hi" maxLength={150} defaultValue={event?.locationHi} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="startAt">Starts (IST)</Label>
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                required
                defaultValue={event ? toDateTimeInputValue(event.startAt) : ""}
                className={inputCls}
              />
            </div>
            <div>
              <Label htmlFor="endAt" optional>Ends (IST)</Label>
              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                defaultValue={event?.endAt ? toDateTimeInputValue(event.endAt) : ""}
                className={inputCls}
              />
            </div>
            <div>
              <Label htmlFor="slug" optional>Web address (slug)</Label>
              <input
                id="slug"
                name="slug"
                maxLength={100}
                defaultValue={event?.slug}
                placeholder="left empty = created from the English title"
                className={inputCls}
              />
            </div>
          </div>

          <div className="rounded-xl border border-line bg-cream-50 p-4">
            <Label htmlFor="image" optional>Event photo (JPEG/PNG/WebP, ≤5 MB)</Label>
            {event?.imageUrl && (
              <div className="relative mt-2 aspect-[3/2] max-w-xs overflow-hidden rounded-lg border border-line">
                <Image src={event.imageUrl} alt={event.imageAlt} fill sizes="320px" className="object-cover" />
              </div>
            )}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-2 w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-saffron-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-saffron-800"
            />
            <div className="mt-3">
              <Label htmlFor="imageAlt" optional>Photo description (alt text)</Label>
              <input id="imageAlt" name="imageAlt" maxLength={200} defaultValue={event?.imageAlt} className={inputCls} />
            </div>
            {event?.imageUrl && (
              <label className="mt-3 flex items-center gap-2 text-sm font-medium text-ink">
                <input type="checkbox" name="removeImage" className="h-4 w-4 accent-saffron-600" />
                Remove the current photo
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="published"
              defaultChecked={event?.published ?? false}
              className="h-4 w-4 accent-saffron-600"
            />
            Published (visible on the site)
          </label>

          <SubmitButton>{event ? "Save changes" : "Create event"}</SubmitButton>
        </form>
      </Card>
    </AdminPage>
  );
}
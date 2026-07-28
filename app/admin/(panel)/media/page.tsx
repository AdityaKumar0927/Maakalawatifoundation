import Image from "next/image";
import { requireAdminPage } from "@/lib/guard";
import { getMedia, mediaSlotDefs } from "@/lib/media";
import { blobConfigured } from "@/lib/upload";
import { AdminPage, Card, ErrorBanner, Label, SavedBanner, inputCls } from "@/components/admin/ui";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/buttons";
import { removeMediaSlot, saveMediaSlot } from "@/app/admin/(panel)/media/actions";

export const metadata = { title: "Images" };

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdminPage();
  const { saved, error } = await searchParams;
  const media = await getMedia();
  const uploadsEnabled = blobConfigured();

  return (
    <AdminPage title="Images">
      {saved && <SavedBanner message="Image saved." />}
      {error && <ErrorBanner message={error} />}
      {!uploadsEnabled && (
        <ErrorBanner message="Image uploads need the BLOB_READ_WRITE_TOKEN environment variable (Vercel → Storage → Blob). Until then the site shows its built-in artwork." />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {mediaSlotDefs.map((slot) => {
          const current = media.get(slot.key);
          return (
            <Card key={slot.key}>
              <h2 className="font-display text-lg text-ink">{slot.label}</h2>
              {slot.help && <p className="mt-1 text-xs text-ink-faint">{slot.help}</p>}

              {current ? (
                <div
                  className={`relative mt-4 aspect-[3/2] overflow-hidden rounded-xl border border-line ${
                    slot.contain ? "bg-white" : ""
                  }`}
                >
                  <Image
                    src={current.url}
                    alt={current.alt}
                    fill
                    sizes="400px"
                    className={slot.contain ? "object-contain p-4" : "object-cover"}
                  />
                </div>
              ) : (
                <p className="bg-motif mt-4 flex aspect-[3/2] items-center justify-center rounded-xl border border-dashed border-line text-sm text-ink-faint">
                  Using built-in artwork
                </p>
              )}

              <form action={saveMediaSlot} className="mt-4 space-y-3">
                <input type="hidden" name="slot" value={slot.key} />
                <div>
                  <Label htmlFor={`file-${slot.key}`}>Upload new image (JPEG/PNG/WebP, ≤5 MB)</Label>
                  <input
                    id={`file-${slot.key}`}
                    name="file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={!uploadsEnabled}
                    className="mt-1 w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-saffron-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-saffron-800"
                  />
                </div>
                <div>
                  <Label htmlFor={`alt-${slot.key}`}>Describe the photo (for screen readers)</Label>
                  <input
                    id={`alt-${slot.key}`}
                    name="alt"
                    defaultValue={current?.alt ?? ""}
                    maxLength={200}
                    className={inputCls}
                  />
                </div>
                <SubmitButton>Save</SubmitButton>
              </form>

              {current && (
                <form action={removeMediaSlot} className="mt-3">
                  <input type="hidden" name="slot" value={slot.key} />
                  <ConfirmSubmit message={`Remove the ${slot.label.toLowerCase()} and go back to built-in artwork?`}>
                    Remove image
                  </ConfirmSubmit>
                </form>
              )}
            </Card>
          );
        })}
      </div>
    </AdminPage>
  );
}
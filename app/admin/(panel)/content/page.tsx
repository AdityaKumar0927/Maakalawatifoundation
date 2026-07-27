import { requireAdminPage } from "@/lib/guard";
import { getContentForAdmin } from "@/lib/content";
import { contentKeyDefs, type ContentGroup } from "@/lib/content-keys";
import { AdminPage, Card, Label, SavedBanner, inputCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { saveContentGroup } from "@/app/admin/(panel)/content/actions";

export const metadata = { title: "Site content" };

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminPage();
  const { saved } = await searchParams;
  const rows = await getContentForAdmin();
  const byKey = new Map(rows.map((r) => [r.key, r]));

  const groups = [...new Set(contentKeyDefs.map((k) => k.group))] as ContentGroup[];

  return (
    <AdminPage title="Site content">
      {saved && <SavedBanner message="Content saved. The site updates immediately." />}
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        Every text below is shown on the public site in both languages. Leave a field empty to use
        the built-in default (shown as the placeholder).
      </p>

      <div className="space-y-6">
        {groups.map((group) => (
          <Card key={group}>
            <form action={saveContentGroup}>
              <input type="hidden" name="group" value={group} />
              <h2 className="font-display text-xl text-ink">{group}</h2>
              <div className="mt-4 space-y-5">
                {contentKeyDefs
                  .filter((k) => k.group === group)
                  .map((def) => {
                    const row = byKey.get(def.key);
                    return (
                      <div key={def.key} className="grid gap-3 md:grid-cols-2">
                        <div>
                          <Label htmlFor={`${def.key}__en`}>{def.label} — English</Label>
                          {def.multiline ? (
                            <textarea
                              id={`${def.key}__en`}
                              name={`${def.key}__en`}
                              rows={3}
                              defaultValue={row?.en ?? ""}
                              placeholder={row?.defaultEn}
                              className={inputCls}
                            />
                          ) : (
                            <input
                              id={`${def.key}__en`}
                              name={`${def.key}__en`}
                              defaultValue={row?.en ?? ""}
                              placeholder={row?.defaultEn}
                              className={inputCls}
                            />
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`${def.key}__hi`}>{def.label} — हिन्दी</Label>
                          {def.multiline ? (
                            <textarea
                              id={`${def.key}__hi`}
                              name={`${def.key}__hi`}
                              rows={3}
                              lang="hi"
                              defaultValue={row?.hi ?? ""}
                              placeholder={row?.defaultHi}
                              className={inputCls}
                            />
                          ) : (
                            <input
                              id={`${def.key}__hi`}
                              name={`${def.key}__hi`}
                              lang="hi"
                              defaultValue={row?.hi ?? ""}
                              placeholder={row?.defaultHi}
                              className={inputCls}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="mt-5">
                <SubmitButton>Save {group.toLowerCase()}</SubmitButton>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </AdminPage>
  );
}
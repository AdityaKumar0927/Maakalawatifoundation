import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { settingDefs } from "@/lib/settings";
import { AdminPage, Card, ErrorBanner, Label, SavedBanner, inputCls } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { saveSettings } from "@/app/admin/(panel)/settings/actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; invalid?: string }>;
}) {
  await requireAdminPage();
  const { saved, invalid } = await searchParams;

  let stored = new Map<string, string>();
  try {
    const rows = await prisma.setting.findMany();
    stored = new Map(rows.map((r) => [r.key, r.value]));
  } catch {
    // fall through with defaults
  }

  const invalidKeys = new Set((invalid ?? "").split(",").filter(Boolean));

  return (
    <AdminPage title="Settings">
      {saved && <SavedBanner message="Settings saved." />}
      {invalidKeys.size > 0 && (
        <ErrorBanner
          message={`Some values were not valid and were skipped: ${[...invalidKeys].join(", ")}. URLs must start with https://.`}
        />
      )}
      <Card>
        <form action={saveSettings} className="space-y-5">
          {settingDefs.map((def) => (
            <div key={def.key}>
              <Label htmlFor={def.key}>{def.label}</Label>
              <input
                id={def.key}
                name={def.key}
                defaultValue={stored.get(def.key) ?? def.defaultValue}
                className={inputCls}
                aria-invalid={invalidKeys.has(def.key) || undefined}
              />
              {def.help && <p className="mt-1 text-xs text-ink-faint">{def.help}</p>}
            </div>
          ))}
          <SubmitButton>Save settings</SubmitButton>
        </form>
      </Card>
    </AdminPage>
  );
}
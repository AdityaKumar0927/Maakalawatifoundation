import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { formatDateTime } from "@/lib/utils";
import { AdminPage, Card, Label, SavedBanner, inputCls } from "@/components/admin/ui";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/buttons";
import { deletePatient, updatePatient } from "@/app/admin/(panel)/patients/actions";

export const metadata = { title: "Patient request" };

function Item({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-ink-faint uppercase">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const { saved } = await searchParams;
  const p = await prisma.patientRegistration.findUnique({ where: { id } });
  if (!p) notFound();

  return (
    <AdminPage title={`Request: ${p.fullName}`}>
      {saved && <SavedBanner message="Saved." />}

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <h2 className="font-display text-lg text-ink">Details</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Item label="Full name" value={p.fullName} />
            <Item label="Age" value={String(p.age)} />
            <Item label="Gender" value={p.gender} />
            <Item label="Phone" value={p.phone} />
            <Item label="City" value={p.city} />
            <Item label="Address" value={p.address} />
            <Item label="Preferred language" value={p.preferredLanguage === "hi" ? "Hindi" : "English"} />
            <Item label="Received" value={formatDateTime(p.createdAt, "en")} />
          </dl>
          <div className="mt-5 rounded-xl bg-cream-50 p-4">
            <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
              Medical help needed
            </p>
            <p className="mt-1 whitespace-pre-line text-ink">{p.need}</p>
          </div>

          {p.guardianName && (
            <div className="mt-5 rounded-xl border border-saffron-200 bg-saffron-50 p-4">
              <p className="text-xs font-semibold tracking-wide text-saffron-800 uppercase">
                Parent / guardian consent (patient under 18)
              </p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <Item label="Guardian" value={p.guardianName} />
                <Item label="Relationship" value={p.guardianRelation ?? ""} />
                <Item label="Guardian phone" value={p.guardianPhone ?? ""} />
                <Item
                  label="Voluntary ID"
                  value={p.guardianIdType ? `${p.guardianIdType} ···${p.guardianIdRef ?? ""}` : ""}
                />
              </dl>
            </div>
          )}

          <p className="mt-5 text-xs text-ink-faint">
            Consent recorded {formatDateTime(p.consentAt, "en")} · notice version {p.consentVersion} ·
            language: {p.consentLanguage === "hi" ? "Hindi" : "English"}
          </p>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg text-ink">Handling</h2>
            <form action={updatePatient} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={p.id} />
              <div>
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" defaultValue={p.status} className={inputCls}>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="SUPPORTED">Supported</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="notes" optional>Internal notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={5}
                  maxLength={3000}
                  defaultValue={p.notes}
                  className={inputCls}
                />
              </div>
              <SubmitButton>Save</SubmitButton>
            </form>
          </Card>

          <Card className="border-cat-health/30">
            <h2 className="font-display text-lg text-cat-health">Erase this record</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Permanent deletion — use when the person asks for erasure (DPDP) or when the
              retention period ends. This cannot be undone.
            </p>
            <form action={deletePatient} className="mt-4">
              <input type="hidden" name="id" value={p.id} />
              <ConfirmSubmit
                message={`Permanently erase the record of ${p.fullName}? This cannot be undone.`}
              >
                Erase permanently
              </ConfirmSubmit>
            </form>
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}
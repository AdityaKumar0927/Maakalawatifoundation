import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { appOrigin } from "@/lib/env";
import { formatDateShort, formatDateTime } from "@/lib/utils";
import {
  AdminPage,
  Card,
  ErrorBanner,
  Label,
  SavedBanner,
  inputCls,
  secondaryBtnCls,
} from "@/components/admin/ui";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/buttons";
import { AddPasskey } from "@/components/admin/AddPasskey";
import { CopyButton } from "@/components/site/CopyButton";
import {
  createInvite,
  deleteCredential,
  deleteInvite,
  setUserActive,
} from "@/app/admin/(panel)/admins/actions";

export const metadata = { title: "Administrators" };

const ERRORS: Record<string, string> = {
  invite: "Please enter a valid email address.",
  self: "You cannot deactivate your own account.",
  "last-key": "You cannot remove your own last passkey — add another one first.",
};

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; invite?: string }>;
}) {
  const me = await requireAdminPage();
  const { saved, error, invite } = await searchParams;
  const isOwner = me.role === "OWNER";

  const [users, invites] = await Promise.all([
    prisma.adminUser.findMany({
      include: { credentials: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.adminInvite.findMany({
      where: { usedAt: null, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const inviteLink = invite ? `${appOrigin()}/admin/setup?invite=${invite}` : null;

  return (
    <AdminPage title="Administrators">
      {saved && <SavedBanner message="Done." />}
      {error && <ErrorBanner message={ERRORS[error] ?? "Something went wrong."} />}

      {inviteLink && (
        <Card className="mb-6 border-forest-200 bg-forest-50">
          <h2 className="font-display text-lg text-forest-800">Invitation created</h2>
          <p className="mt-2 text-sm leading-relaxed text-forest-900">
            Share this link with the new administrator over a private channel (in person or an
            end-to-end encrypted chat). It works once and expires in 72 hours. It will not be
            shown again.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-white p-3">
            <code className="text-xs break-all text-ink">{inviteLink}</code>
            <CopyButton value={inviteLink} label="Copy link" copiedLabel="Copied!" />
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-display text-lg text-ink">My passkeys</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Add a passkey on each device you sign in from (phone, laptop). If you lose one, an
          owner can remove it below.
        </p>
        <div className="mt-4">
          <AddPasskey />
        </div>
      </Card>

      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">
                  {user.name}
                  <span className="ml-2 rounded-full bg-cream-200 px-2 py-0.5 text-xs font-medium text-ink-soft">
                    {user.role}
                  </span>
                  {!user.active && (
                    <span className="ml-2 rounded-full bg-cat-health-soft px-2 py-0.5 text-xs font-medium text-cat-health">
                      Deactivated
                    </span>
                  )}
                  {user.id === me.id && (
                    <span className="ml-2 text-xs text-ink-faint">(you)</span>
                  )}
                </p>
                <p className="text-sm text-ink-faint">
                  {user.email} · joined {formatDateShort(user.createdAt, "en")}
                </p>
              </div>
              {isOwner && user.id !== me.id && (
                <form action={setUserActive}>
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="active" value={String(!user.active)} />
                  <ConfirmSubmit
                    className={secondaryBtnCls}
                    message={
                      user.active
                        ? `Deactivate ${user.name}? Their sessions are revoked immediately.`
                        : `Reactivate ${user.name}?`
                    }
                  >
                    {user.active ? "Deactivate" : "Reactivate"}
                  </ConfirmSubmit>
                </form>
              )}
            </div>

            {user.credentials.length > 0 && (
              <ul className="mt-4 space-y-2">
                {user.credentials.map((cred) => (
                  <li
                    key={cred.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream-50 px-4 py-2.5"
                  >
                    <span className="text-sm text-ink">
                      🔑 {cred.deviceName}
                      <span className="ml-2 text-xs text-ink-faint">
                        {cred.lastUsedAt
                          ? `last used ${formatDateTime(cred.lastUsedAt, "en")}`
                          : "never used"}
                      </span>
                    </span>
                    {isOwner && (
                      <form action={deleteCredential}>
                        <input type="hidden" name="id" value={cred.id} />
                        <ConfirmSubmit
                          className="text-xs font-semibold text-cat-health hover:underline"
                          message={`Remove the passkey "${cred.deviceName}" of ${user.name}?`}
                        >
                          Remove
                        </ConfirmSubmit>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>

      {isOwner && (
        <Card className="mt-6">
          <h2 className="font-display text-lg text-ink">Invite an administrator</h2>
          <form action={createInvite} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="invite-email">Their email</Label>
              <input
                id="invite-email"
                name="email"
                type="email"
                required
                className={`${inputCls} w-64`}
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <select id="invite-role" name="role" defaultValue="ADMIN" className={inputCls}>
                <option value="ADMIN">Admin (content & records)</option>
                <option value="OWNER">Owner (full control)</option>
              </select>
            </div>
            <SubmitButton>Create invite link</SubmitButton>
          </form>

          {invites.length > 0 && (
            <ul className="mt-5 space-y-2">
              {invites.map((inv) => (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream-50 px-4 py-2.5 text-sm"
                >
                  <span className="text-ink">
                    {inv.email}
                    <span className="ml-2 text-xs text-ink-faint">
                      {inv.role} · expires {formatDateTime(inv.expiresAt, "en")}
                    </span>
                  </span>
                  <form action={deleteInvite}>
                    <input type="hidden" name="id" value={inv.id} />
                    <ConfirmSubmit
                      className="text-xs font-semibold text-cat-health hover:underline"
                      message={`Revoke the invite for ${inv.email}?`}
                    >
                      Revoke
                    </ConfirmSubmit>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </AdminPage>
  );
}
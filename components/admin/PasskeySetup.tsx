"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { passkeyRegister } from "@/components/admin/passkey-client";

const inputCls =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-200";

/**
 * Enrolment screen for the first OWNER (setup token from the environment)
 * or an invited admin (?invite=… link created by an OWNER).
 */
export function PasskeySetup({ inviteToken }: { inviteToken: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enroll(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await passkeyRegister(
        inviteToken
          ? { mode: "invite", token: inviteToken, name }
          : { mode: "setup", email, name, token },
        deviceName || undefined
      );
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrolment failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={enroll} className="w-full space-y-4">
      {!inviteToken && (
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink">
            Your email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputCls}
          />
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-ink">
          Your name
        </label>
        <input
          id="name"
          type="text"
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className={inputCls}
        />
      </div>

      {!inviteToken && (
        <div>
          <label htmlFor="token" className="block text-sm font-semibold text-ink">
            Setup token
          </label>
          <input
            id="token"
            type="password"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-ink-faint">
            The ADMIN_SETUP_TOKEN configured for the deployment.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="deviceName" className="block text-sm font-semibold text-ink">
          Passkey name <span className="font-normal text-ink-faint">(optional)</span>
        </label>
        <input
          id="deviceName"
          type="text"
          maxLength={60}
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="e.g. My phone"
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-ink px-8 py-4 font-semibold text-cream-50 shadow-soft transition hover:bg-black disabled:opacity-60"
      >
        {busy ? "Follow your device's prompts…" : "Create passkey & sign in"}
      </button>

      {error && (
        <p role="alert" className="rounded-xl bg-cat-health-soft p-3 text-center text-sm font-medium text-cat-health">
          {error}
        </p>
      )}
    </form>
  );
}

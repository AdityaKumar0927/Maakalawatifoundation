"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { passkeyLogin } from "@/components/admin/passkey-client";

export function PasskeyLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      await passkeyLogin();
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 font-semibold text-cream-50 shadow-soft transition hover:bg-black disabled:opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6.5 2.5a2.5 2.5 0 0 1 1 4.8V21l-1.5 1-1.5-1v-.8l1-.7-1-.7v-1a2.5 2.5 0 0 1 2-4.3ZM12 13c1.5 0 2.9.3 4 .8a4.5 4.5 0 0 0-1.5 5.7V21H4v-2c0-3.3 3.6-6 8-6Z"
            fill="currentColor"
          />
        </svg>
        {busy ? "Waiting for your passkey…" : "Sign in with passkey"}
      </button>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-cat-health-soft p-3 text-center text-sm font-medium text-cat-health">
          {error}
        </p>
      )}
    </div>
  );
}
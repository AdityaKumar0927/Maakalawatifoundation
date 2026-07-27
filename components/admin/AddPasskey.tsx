"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { passkeyRegister } from "@/components/admin/passkey-client";
import { inputCls } from "@/components/admin/ui";

export function AddPasskey() {
  const router = useRouter();
  const [deviceName, setDeviceName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function add() {
    setBusy(true);
    setError(null);
    try {
      await passkeyRegister({ mode: "add" }, deviceName || undefined);
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add the passkey");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm font-semibold text-ink">
          Passkey name
          <input
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            maxLength={60}
            placeholder="e.g. Office laptop"
            className={`${inputCls} w-56`}
          />
        </label>
        <button
          type="button"
          onClick={add}
          disabled={busy}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-black disabled:opacity-60"
        >
          {busy ? "Follow your device's prompts…" : "+ Add a passkey to my account"}
        </button>
      </div>
      {done && <p className="mt-2 text-sm font-medium text-forest-700">Passkey added.</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-cat-health">
          {error}
        </p>
      )}
    </div>
  );
}
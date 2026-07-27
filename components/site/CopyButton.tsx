"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (very old browser) — the value is visible as text.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-forest-300 bg-white px-4 py-2 text-sm font-semibold text-forest-700 transition hover:bg-forest-50"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
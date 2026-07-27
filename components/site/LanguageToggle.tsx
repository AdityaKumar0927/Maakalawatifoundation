"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/locales";

/**
 * Header language switch. A plain anchor (not <Link>) on purpose: the
 * /set-locale route must run server-side to persist the cookie before
 * redirecting to the same page in the other language.
 */
export function LanguageToggle({
  locale,
  switchToHindi,
  switchToEnglish,
}: {
  locale: Locale;
  switchToHindi: string;
  switchToEnglish: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const other: Locale = locale === "hi" ? "en" : "hi";
  const stripped = pathname.replace(/^\/(en|hi)(?=\/|$)/, "");
  const target = `/${other}${stripped}` || `/${other}`;
  const href = `/set-locale/${other}?next=${encodeURIComponent(target)}`;

  return (
    <a
      href={href}
      lang={other}
      aria-label={other === "hi" ? switchToHindi : switchToEnglish}
      className="inline-flex items-center rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:border-saffron-300 hover:text-ink"
    >
      {other === "hi" ? "हिन्दी" : "English"}
    </a>
  );
}
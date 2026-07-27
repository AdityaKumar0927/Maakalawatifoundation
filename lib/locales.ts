/** Locale constants usable anywhere (no dictionary imports — proxy-safe). */

export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "mkf_locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "hi";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "hi" ? "en" : "hi";
}

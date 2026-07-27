import type { Locale } from "@/lib/i18n";

/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const dateLocale = (locale: Locale) => (locale === "hi" ? "hi-IN" : "en-IN");

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function formatDateTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function formatDateShort(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(dateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

/** yyyy-mm-dd (IST) for <input type="date"> values. */
export function toDateInputValue(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** yyyy-mm-ddTHH:mm (IST) for <input type="datetime-local"> values. */
export function toDateTimeInputValue(date: Date): string {
  const day = toDateInputValue(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${day}T${time}`;
}

/**
 * Parse admin date/datetime-local input as IST (the foundation's timezone),
 * regardless of the server's timezone. Returns null when invalid/empty.
 */
export function parseISTDateTime(value: string): Date | null {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : value;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) return null;
  const date = new Date(`${normalized}:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

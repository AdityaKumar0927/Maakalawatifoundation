import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import type { Locale } from "@/lib/locales";

export * from "@/lib/locales";

/** hi.json must keep the exact shape of en.json (enforced by this type). */
export type Dictionary = typeof en;

export function getDict(locale: Locale): Dictionary {
  return locale === "hi" ? (hi as Dictionary) : en;
}

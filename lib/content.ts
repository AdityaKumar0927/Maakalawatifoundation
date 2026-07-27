import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { contentKeys, type ContentKey } from "@/lib/content-keys";
import { getDict, type Locale } from "@/lib/i18n";

/**
 * Editable site copy = built-in defaults (messages/*.json "content"
 * namespace) overridden by SiteContent rows. Fails open to defaults so the
 * public site renders even with an empty or unreachable database.
 */

const getOverrides = cache(async (): Promise<Map<string, { en: string; hi: string }>> => {
  try {
    const rows = await prisma.siteContent.findMany();
    return new Map(rows.map((r) => [r.key, { en: r.en, hi: r.hi }]));
  } catch {
    return new Map();
  }
});

export type SiteCopy = Record<ContentKey, string>;

export const getContent = cache(async (locale: Locale): Promise<SiteCopy> => {
  const dict = getDict(locale);
  const defaults = dict.content as Record<string, string>;
  const overrides = await getOverrides();
  const out = {} as SiteCopy;
  for (const def of contentKeys) {
    const override = overrides.get(def.key);
    const value = locale === "hi" ? override?.hi : override?.en;
    out[def.key] = value || defaults[def.key] || "";
  }
  return out;
});

/** Both-language view for the admin editor. */
export async function getContentForAdmin(): Promise<
  Array<{ key: string; en: string; hi: string; defaultEn: string; defaultHi: string }>
> {
  const [en, hi, overrides] = [
    getDict("en").content as Record<string, string>,
    getDict("hi").content as Record<string, string>,
    await getOverrides(),
  ];
  return contentKeys.map((def) => ({
    key: def.key,
    en: overrides.get(def.key)?.en ?? "",
    hi: overrides.get(def.key)?.hi ?? "",
    defaultEn: en[def.key] ?? "",
    defaultHi: hi[def.key] ?? "",
  }));
}

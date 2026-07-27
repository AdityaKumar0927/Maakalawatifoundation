import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

const POLICY_UPDATED = new Date("2026-07-27T00:00:00+05:30");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).privacy.title };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const p = dict.privacy;
  const settings = await getSettings();

  const fill = (text: string) =>
    text
      .replace("{days}", settings.responseDays)
      .replace("{phone}", settings.phone)
      .replace("{date}", formatDate(POLICY_UPDATED, locale));

  const sections = [
    [p.s1h, p.s1p],
    [p.s2h, p.s2p],
    [p.s3h, p.s3p],
    [p.s4h, p.s4p],
    [p.s5h, p.s5p],
    [p.s6h, p.s6p],
    [p.s7h, p.s7p],
    [p.s8h, p.s8p],
    [p.s9h, p.s9p],
    [p.s10h, p.s10p],
    [p.s11h, p.s11p],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-16">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">{p.title}</h1>
      <p className="mt-3 text-sm text-ink-faint">{fill(p.updated)}</p>
      <div className="mt-10 space-y-9">
        {sections.map(([h, body]) => (
          <section key={h}>
            <h2 className="font-display text-2xl text-ink">{h}</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{fill(body)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
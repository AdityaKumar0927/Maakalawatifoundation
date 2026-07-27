import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

const TERMS_UPDATED = new Date("2026-07-27T00:00:00+05:30");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).terms.title };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale).terms;

  const sections = [
    [t.s1h, t.s1p],
    [t.s2h, t.s2p],
    [t.s3h, t.s3p],
    [t.s4h, t.s4p],
    [t.s5h, t.s5p],
    [t.s6h, t.s6p],
    [t.s7h, t.s7p],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-16">
      <h1 className="font-display text-4xl text-ink sm:text-5xl">{t.title}</h1>
      <p className="mt-3 text-sm text-ink-faint">
        {t.updated.replace("{date}", formatDate(TERMS_UPDATED, locale))}
      </p>
      <div className="mt-10 space-y-9">
        {sections.map(([h, body]) => (
          <section key={h}>
            <h2 className="font-display text-2xl text-ink">{h}</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { SiteMark } from "@/components/site/SiteMark";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).donate.thankTitle, robots: { index: false } };
}

/** Return page for the payment gateway's success redirect. */
export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <SiteMark size={72} />
      <h1 className="font-display mt-8 text-4xl text-ink sm:text-5xl">{dict.donate.thankTitle}</h1>
      <p className="mt-5 text-xl leading-relaxed text-ink-soft">{dict.donate.thankText}</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link
          href={`/${locale}/work`}
          className="rounded-full bg-forest-600 px-7 py-3.5 font-semibold text-white shadow-soft transition hover:bg-forest-700"
        >
          {dict.donate.thankShare}
        </Link>
        <Link
          href={`/${locale}`}
          className="rounded-full border border-line bg-white px-7 py-3.5 font-semibold text-ink-soft transition hover:text-ink"
        >
          {dict.common.cta.backToHome}
        </Link>
      </div>
    </div>
  );
}
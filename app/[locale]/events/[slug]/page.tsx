import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getEventBySlug } from "@/lib/public-data";
import { formatDate, formatDateTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return { title: locale === "hi" ? event.titleHi : event.titleEn };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  const dict = getDict(locale);

  const title = locale === "hi" ? event.titleHi : event.titleEn;
  const summary = locale === "hi" ? event.summaryHi : event.summaryEn;
  const body = locale === "hi" ? event.bodyHi : event.bodyEn;
  const location = locale === "hi" ? event.locationHi : event.locationEn;

  return (
    <article>
      <div className="border-b border-line bg-cream-50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-16">
          <h1 className="font-display text-balance text-3xl leading-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {summary && <p className="mt-5 text-xl leading-relaxed text-ink-soft">{summary}</p>}

          <dl className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-white p-4">
              <dt className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                {dict.events.when}
              </dt>
              <dd className="mt-1 font-medium text-ink">
                {formatDateTime(event.startAt, locale)}
                {event.endAt && <> – {formatDate(event.endAt, locale)}</>}
              </dd>
            </div>
            {location && (
              <div className="rounded-xl border border-line bg-white p-4">
                <dt className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
                  {dict.events.where}
                </dt>
                <dd className="mt-1 font-medium text-ink">{location}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {event.imageUrl && (
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-lift">
            <Image
              src={event.imageUrl}
              alt={event.imageAlt}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {body && (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="space-y-5 text-lg leading-relaxed whitespace-pre-line text-ink-soft">
            {body}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <Link href={`/${locale}/events`} className="text-sm font-semibold text-saffron-700 hover:underline">
          ← {dict.events.title}
        </Link>
      </div>
    </article>
  );
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getPastEvents, getUpcomingEvents } from "@/lib/public-data";
import { EventCard } from "@/components/site/cards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).events.title };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const [upcoming, past] = await Promise.all([getUpcomingEvents(24), getPastEvents(12)]);

  return (
    <>
      <section className="border-b border-line bg-cream-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20">
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{dict.events.title}</h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-ink-soft">{dict.events.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14 sm:px-6">
        <section aria-labelledby="upcoming">
          <h2 id="upcoming" className="font-display text-2xl text-ink sm:text-3xl">
            {dict.events.upcomingHeading}
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-6 max-w-xl rounded-2xl border border-line bg-white p-8 text-lg leading-relaxed text-ink-soft shadow-soft">
              {dict.events.empty}
            </p>
          ) : (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} locale={locale} dict={dict} />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section aria-labelledby="past">
            <h2 id="past" className="font-display text-2xl text-ink-soft sm:text-3xl">
              {dict.events.pastHeading}
            </h2>
            <div className="mt-6 grid gap-5 opacity-80 lg:grid-cols-2">
              {past.map((e) => (
                <EventCard key={e.id} event={e} locale={locale} dict={dict} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
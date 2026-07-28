import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { getMedia } from "@/lib/media";
import { getFeaturedProjects, getUpcomingEvents } from "@/lib/public-data";
import { SectionHeading, SectionLink } from "@/components/site/Section";
import { EventCard, ProjectCard } from "@/components/site/cards";
import { PillarIcon, pillarOrder, pillarStyle } from "@/components/site/pillars";
import { SiteMark } from "@/components/site/SiteMark";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const [copy, media, projects, events] = await Promise.all([
    getContent(locale),
    getMedia(),
    getFeaturedProjects(3),
    getUpcomingEvents(3),
  ]);
  const base = `/${locale}`;
  const hero = media.get("hero");
  const story = media.get("story");

  const stats = ([1, 2, 3, 4] as const)
    .map((i) => ({ value: copy[`stats.${i}.value`], label: copy[`stats.${i}.label`] }))
    .filter((s) => s.value && s.label);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="bg-motif pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-saffron-100 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[7fr_5fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-saffron-200 bg-saffron-50 px-4 py-1.5 text-sm font-medium text-saffron-800">
              {copy["hero.badge"]}
            </p>
            <h1 className="font-display text-balance mt-6 text-4xl leading-[1.15] text-ink sm:text-5xl lg:text-6xl">
              {copy["hero.title"]}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              {copy["hero.subtitle"]}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={`${base}/donate`}
                className="rounded-full bg-saffron-600 px-7 py-3.5 font-semibold text-white shadow-soft transition hover:bg-saffron-700"
              >
                {dict.common.cta.donateNow}
              </Link>
              <Link
                href={`${base}/register-patient`}
                className="rounded-full border border-forest-300 bg-white px-7 py-3.5 font-semibold text-forest-700 transition hover:border-forest-400 hover:bg-forest-50"
              >
                {dict.common.cta.getSupport}
              </Link>
            </div>
          </div>

          <div className="relative">
            {hero ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src={hero.url}
                  alt={hero.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                aria-hidden
                className="relative mx-auto flex aspect-square max-w-md items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full border border-saffron-200" />
                <div className="absolute inset-8 rounded-full border border-saffron-200/80" />
                <div className="absolute inset-16 rounded-full border border-forest-200" />
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-lift sm:h-48 sm:w-48">
                  <SiteMark size={110} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Mission + pillars ────────────────────────────────────────── */}
      <section className="border-t border-line bg-cream-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <SectionHeading
            eyebrow={dict.common.siteName}
            title={copy["mission.heading"]}
            sub={copy["mission.intro"]}
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillarOrder.map((cat) => {
              const style = pillarStyle[cat];
              return (
                <div
                  key={cat}
                  className="rounded-2xl border border-line bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ color: style.fg, backgroundColor: style.bg }}
                  >
                    <PillarIcon category={cat} />
                  </span>
                  <h3 className="font-display mt-5 text-xl text-ink">
                    {copy[`pillar.${style.contentKey}.title`]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {copy[`pillar.${style.contentKey}.desc`]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Impact numbers (hidden until real numbers are set) ───────── */}
      {stats.length >= 2 && (
        <section className="bg-forest-800">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 text-center sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl text-cream-100 sm:text-5xl">{s.value}</p>
                <p className="mt-2 text-sm font-medium tracking-wide text-forest-200">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured work ────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading title={dict.home.workHeading} sub={dict.home.workSub} />
              <SectionLink href={`${base}/work`} label={dict.home.seeAllWork} />
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} locale={locale} dict={dict} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Story spotlight (one named story, per NGO design research) ─ */}
      {copy["story.name"] && copy["story.text"] && (
        <section className="border-y border-line bg-cream-50">
          <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[2fr_3fr] md:py-20">
            <div className="relative">
              {story ? (
                <div className="relative aspect-square overflow-hidden rounded-3xl shadow-lift">
                  <Image
                    src={story.url}
                    alt={story.alt || copy["story.name"]}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  aria-hidden
                  className="bg-motif flex aspect-square items-center justify-center rounded-3xl border border-line bg-saffron-50"
                >
                  <SiteMark size={90} />
                </div>
              )}
            </div>
            <figure>
              <p className="text-sm font-semibold tracking-wide text-saffron-700 uppercase">
                {copy["story.heading"]}
              </p>
              <blockquote className="font-display mt-4 text-2xl leading-snug text-ink">
                “{copy["story.text"]}”
              </blockquote>
              <figcaption className="mt-5 font-semibold text-forest-700">
                — {copy["story.name"]}
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* ── Upcoming events ──────────────────────────────────────────── */}
      {events.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading title={dict.home.eventsHeading} />
              <SectionLink href={`${base}/events`} label={dict.home.seeAllEvents} />
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} event={e} locale={locale} dict={dict} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Donate band ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-saffron-700">
        <div className="bg-motif absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between md:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-balance text-3xl text-white sm:text-4xl">
              {dict.home.donateBandTitle}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-saffron-100">
              {dict.home.donateBandText}
            </p>
          </div>
          <Link
            href={`${base}/donate`}
            className="shrink-0 rounded-full bg-white px-8 py-4 font-semibold text-saffron-800 shadow-lift transition hover:bg-saffron-50"
          >
            {dict.common.cta.donateNow}
          </Link>
        </div>
      </section>

      {/* ── Patient support band ─────────────────────────────────────── */}
      <section className="bg-cream-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              {dict.home.supportBandTitle}
            </h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{dict.home.supportBandText}</p>
          </div>
          <Link
            href={`${base}/register-patient`}
            className="shrink-0 rounded-full bg-forest-600 px-7 py-3.5 font-semibold text-white shadow-soft transition hover:bg-forest-700"
          >
            {dict.common.cta.getSupport}
          </Link>
        </div>
      </section>

      {/* ── Get involved ─────────────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <SectionHeading center title={copy["getinvolved.heading"]} sub={copy["getinvolved.text"]} />
          <Link
            href={`${base}/contact`}
            className="mt-8 inline-flex rounded-full border border-saffron-300 bg-white px-7 py-3.5 font-semibold text-saffron-800 transition hover:bg-saffron-50"
          >
            {dict.common.cta.contactUs}
          </Link>
        </div>
      </section>
    </>
  );
}
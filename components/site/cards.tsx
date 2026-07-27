import Link from "next/link";
import Image from "next/image";
import type { Event, Project, ProjectCategory } from "@prisma/client";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { PillarIcon, pillarStyle } from "@/components/site/pillars";

export function CategoryChip({
  category,
  dict,
}: {
  category: ProjectCategory;
  dict: Dictionary;
}) {
  const style = pillarStyle[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ color: style.fg, backgroundColor: style.bg }}
    >
      <PillarIcon category={category} size={14} />
      {dict.work.categories[category]}
    </span>
  );
}

function CardImage({
  imageUrl,
  imageAlt,
  category,
}: {
  imageUrl: string | null;
  imageAlt: string;
  category?: ProjectCategory;
}) {
  if (imageUrl) {
    return (
      <div className="relative aspect-[3/2] overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }
  const style = category ? pillarStyle[category] : null;
  return (
    <div
      aria-hidden
      className="bg-motif flex aspect-[3/2] items-center justify-center"
      style={{ backgroundColor: style?.bg ?? "var(--color-cream-200)" }}
    >
      <span style={{ color: style?.fg ?? "var(--color-ink-faint)" }}>
        {category ? <PillarIcon category={category} size={44} /> : null}
      </span>
    </div>
  );
}

export function ProjectCard({
  project,
  locale,
  dict,
}: {
  project: Project;
  locale: Locale;
  dict: Dictionary;
}) {
  const title = locale === "hi" ? project.titleHi : project.titleEn;
  const summary = locale === "hi" ? project.summaryHi : project.summaryEn;
  return (
    <Link
      href={`/${locale}/work/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
    >
      <CardImage imageUrl={project.imageUrl} imageAlt={project.imageAlt} category={project.category} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <CategoryChip category={project.category} dict={dict} />
        <h3 className="font-display text-xl leading-snug text-ink">{title}</h3>
        {summary && <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">{summary}</p>}
      </div>
    </Link>
  );
}

export function EventCard({
  event,
  locale,
  dict,
}: {
  event: Event;
  locale: Locale;
  dict: Dictionary;
}) {
  const title = locale === "hi" ? event.titleHi : event.titleEn;
  const summary = locale === "hi" ? event.summaryHi : event.summaryEn;
  const location = locale === "hi" ? event.locationHi : event.locationEn;
  const day = new Intl.DateTimeFormat("en-IN", { day: "2-digit", timeZone: "Asia/Kolkata" }).format(event.startAt);
  const month = new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(event.startAt);

  return (
    <Link
      href={`/${locale}/events/${event.slug}`}
      className="group flex gap-5 rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div
        aria-hidden
        className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-forest-50 text-forest-700"
      >
        <span className="font-display text-2xl leading-none font-semibold">{day}</span>
        <span className="mt-0.5 text-xs font-medium">{month}</span>
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg leading-snug text-ink group-hover:text-saffron-800">
          {title}
        </h3>
        <p className="mt-1 text-sm text-ink-faint">
          {formatDate(event.startAt, locale)}
          {location && <> · {location}</>}
        </p>
        {summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{summary}</p>}
      </div>
      <span className="sr-only">{dict.common.cta.readMore}</span>
    </Link>
  );
}
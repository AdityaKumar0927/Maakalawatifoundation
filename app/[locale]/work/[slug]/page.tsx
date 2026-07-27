import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getProjectBySlug } from "@/lib/public-data";
import { CategoryChip } from "@/components/site/cards";
import { formatDateShort } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return { title: locale === "hi" ? project.titleHi : project.titleEn };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const dict = getDict(locale);

  const title = locale === "hi" ? project.titleHi : project.titleEn;
  const summary = locale === "hi" ? project.summaryHi : project.summaryEn;
  const body = locale === "hi" ? project.bodyHi : project.bodyEn;

  return (
    <article>
      <div className="border-b border-line bg-cream-50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-16">
          <CategoryChip category={project.category} dict={dict} />
          <h1 className="font-display text-balance mt-5 text-3xl leading-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {summary && <p className="mt-5 text-xl leading-relaxed text-ink-soft">{summary}</p>}
          <p className="mt-4 text-sm text-ink-faint">
            {formatDateShort(project.updatedAt, locale)}
          </p>
        </div>
      </div>

      {project.imageUrl && (
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-lift">
            <Image
              src={project.imageUrl}
              alt={project.imageAlt}
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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-saffron-200 bg-saffron-50 p-6">
          <p className="font-display text-xl text-saffron-900">{dict.home.donateBandTitle}</p>
          <Link
            href={`/${locale}/donate`}
            className="rounded-full bg-saffron-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-saffron-700"
          >
            {dict.common.cta.donateNow}
          </Link>
        </div>
        <p className="mt-8">
          <Link href={`/${locale}/work`} className="text-sm font-semibold text-saffron-700 hover:underline">
            ← {dict.work.title}
          </Link>
        </p>
      </div>
    </article>
  );
}
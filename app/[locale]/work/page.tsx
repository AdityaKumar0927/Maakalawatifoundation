import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ProjectCategory } from "@prisma/client";
import { getDict, isLocale } from "@/lib/i18n";
import { getPublishedProjects } from "@/lib/public-data";
import { ProjectCard } from "@/components/site/cards";
import { PillarIcon, pillarOrder, pillarStyle } from "@/components/site/pillars";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).work.title };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const projects = await getPublishedProjects();

  const byCategory = new Map<ProjectCategory, typeof projects>();
  for (const p of projects) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }

  return (
    <>
      <section className="border-b border-line bg-cream-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20">
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{dict.work.title}</h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-ink-soft">{dict.work.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {projects.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 text-center text-lg leading-relaxed text-ink-soft shadow-soft">
            {dict.work.empty}
          </p>
        ) : (
          <div className="space-y-16">
            {pillarOrder.map((cat) => {
              const list = byCategory.get(cat);
              if (!list || list.length === 0) return null;
              const style = pillarStyle[cat];
              return (
                <section key={cat} aria-labelledby={`cat-${cat}`}>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ color: style.fg, backgroundColor: style.bg }}
                    >
                      <PillarIcon category={cat} size={22} />
                    </span>
                    <h2 id={`cat-${cat}`} className="font-display text-2xl text-ink sm:text-3xl">
                      {dict.work.categories[cat]}
                    </h2>
                  </div>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((p) => (
                      <ProjectCard key={p.id} project={p} locale={locale} dict={dict} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
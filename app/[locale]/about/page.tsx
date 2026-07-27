import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { getMedia } from "@/lib/media";
import { getSettings } from "@/lib/settings";
import { SectionHeading } from "@/components/site/Section";
import { PillarIcon, pillarOrder, pillarStyle } from "@/components/site/pillars";
import { Logo } from "@/components/site/Logo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).about.title };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const [copy, media, settings] = await Promise.all([
    getContent(locale),
    getMedia(),
    getSettings(),
  ]);
  const photo = media.get("about");

  return (
    <>
      <section className="border-b border-line bg-cream-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20">
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{dict.about.title}</h1>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-ink-soft">
            {copy["about.lead"]}
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[3fr_2fr]">
          <div>
            <SectionHeading title={dict.about.storyHeading} />
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>{copy["about.story1"]}</p>
              <p>{copy["about.story2"]}</p>
              <p>{copy["about.story3"]}</p>
            </div>
          </div>
          <div>
            {photo ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lift">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                aria-hidden
                className="bg-motif flex aspect-[4/5] items-center justify-center rounded-3xl border border-line bg-saffron-50"
              >
                <Logo size={110} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-cream-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-saffron-200 bg-white p-8 shadow-soft">
            <h2 className="font-display text-2xl text-saffron-800">{dict.about.missionHeading}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{copy["about.mission"]}</p>
          </div>
          <div className="rounded-2xl border border-forest-200 bg-white p-8 shadow-soft">
            <h2 className="font-display text-2xl text-forest-700">{dict.about.visionHeading}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{copy["about.vision"]}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <SectionHeading title={dict.about.pillarsHeading} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {pillarOrder.map((cat) => {
              const style = pillarStyle[cat];
              return (
                <div key={cat} className="flex gap-5 rounded-2xl border border-line bg-white p-6 shadow-soft">
                  <span
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ color: style.fg, backgroundColor: style.bg }}
                  >
                    <PillarIcon category={cat} />
                  </span>
                  <div>
                    <h3 className="font-display text-xl text-ink">
                      {copy[`pillar.${style.contentKey}.title`]}
                    </h3>
                    <p className="mt-1.5 leading-relaxed text-ink-soft">
                      {copy[`pillar.${style.contentKey}.desc`]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-cream-50">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
          <SectionHeading title={dict.about.reachHeading} />
          <div className="mt-6 rounded-2xl border border-line bg-white p-7 shadow-soft">
            <p className="whitespace-pre-line text-lg leading-relaxed text-ink-soft">
              {copy["contact.address"]}
            </p>
            <p className="mt-2 text-ink-faint">{copy["contact.landmark"]}</p>
            <p className="mt-4 font-medium text-ink">
              {dict.common.footer.phone}:{" "}
              <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="text-saffron-700">
                {settings.phone}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

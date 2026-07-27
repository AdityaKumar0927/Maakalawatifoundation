import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).contact.title };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const [copy, settings] = await Promise.all([getContent(locale), getSettings()]);

  return (
    <>
      <section className="border-b border-line bg-cream-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20">
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{dict.contact.title}</h1>
          <p className="mt-4 text-xl leading-relaxed text-ink-soft">{dict.contact.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-7 shadow-soft sm:col-span-2">
            <h2 className="font-display text-xl text-ink">{dict.contact.addressHeading}</h2>
            <p className="mt-3 text-lg leading-relaxed whitespace-pre-line text-ink-soft">
              {copy["contact.address"]}
            </p>
            <p className="mt-2 text-ink-faint">{copy["contact.landmark"]}</p>
            {settings.mapsUrl && (
              <a
                href={settings.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex rounded-full border border-forest-300 bg-white px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-50"
              >
                {dict.contact.mapCta}
                <span className="sr-only"> ({dict.common.a11y.externalLink})</span>
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-7 shadow-soft">
            <h2 className="font-display text-xl text-ink">{dict.contact.phoneHeading}</h2>
            <a
              href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
              className="mt-3 block text-2xl font-semibold text-saffron-700"
            >
              {settings.phone}
            </a>
            {settings.officeHours && (
              <p className="mt-3 text-sm text-ink-soft">
                <span className="font-medium text-ink">{dict.contact.hoursHeading}: </span>
                {settings.officeHours}
              </p>
            )}
          </div>

          {settings.email && (
            <div className="rounded-2xl border border-line bg-white p-7 shadow-soft">
              <h2 className="font-display text-xl text-ink">{dict.contact.emailHeading}</h2>
              <a
                href={`mailto:${settings.email}`}
                className="mt-3 block text-lg font-semibold break-all text-saffron-700"
              >
                {settings.email}
              </a>
            </div>
          )}
        </div>

        <div className="mt-10 rounded-2xl border border-forest-200 bg-forest-50 p-7">
          <h2 className="font-display text-xl text-forest-800">{dict.contact.grievanceHeading}</h2>
          <p className="mt-3 leading-relaxed text-forest-900">
            {dict.contact.grievanceText.replace("{days}", settings.responseDays)}
          </p>
          {(settings.grievanceName || settings.grievanceEmail) && (
            <p className="mt-4 font-medium text-forest-900">
              {[settings.grievanceName, settings.grievanceEmail, settings.grievancePhone]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { PatientForm } from "@/components/site/PatientForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).patient.title };
}

export default async function RegisterPatientPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const settings = await getSettings();

  return (
    <>
      <section className="border-b border-line bg-cream-50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-16">
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{dict.patient.title}</h1>
          <p className="mt-4 text-xl leading-relaxed text-ink-soft">{dict.patient.intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <PatientForm locale={locale} dict={dict} responseDays={settings.responseDays} />
      </div>
    </>
  );
}
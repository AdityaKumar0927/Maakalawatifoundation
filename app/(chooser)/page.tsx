import { connection } from "next/server";
import { SiteMark } from "@/components/site/SiteMark";

/**
 * First-visit language gate. Deliberately bilingual and dictionary-free:
 * each option is written in its own script so every visitor can read at
 * least one of them. The choice is remembered for a year.
 */
export default async function LanguageChooser() {
  await connection();
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="bg-motif pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-saffron-100 blur-3xl"
        aria-hidden
      />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <SiteMark size={72} />

        <h1 className="font-display mt-8 text-4xl leading-tight text-ink sm:text-5xl">
          Maa Kalawati Foundation
        </h1>
        <p lang="hi" className="mt-2 text-2xl text-ink-soft">
          माँ कलावती फ़ाउंडेशन
        </p>

        <p className="mt-6 text-sm font-medium tracking-wide text-saffron-700 uppercase">
          We care · We serve · We empower
        </p>

        <div className="mt-12 grid w-full gap-4 sm:grid-cols-2">
          <a
            href="/set-locale/hi"
            lang="hi"
            className="group rounded-2xl border border-line bg-white px-8 py-7 shadow-soft transition hover:-translate-y-0.5 hover:border-saffron-300 hover:shadow-lift"
          >
            <span className="block text-2xl font-semibold text-ink">हिन्दी</span>
            <span className="mt-1 block text-ink-faint">
              हिन्दी में जारी रखें{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
          <a
            href="/set-locale/en"
            className="group rounded-2xl border border-line bg-white px-8 py-7 shadow-soft transition hover:-translate-y-0.5 hover:border-saffron-300 hover:shadow-lift"
          >
            <span className="block text-2xl font-semibold text-ink">English</span>
            <span className="mt-1 block text-ink-faint">
              Continue in English{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
        </div>

        <p className="mt-10 text-sm text-ink-faint">
          Sikanderpur · MG Road · Gurugram, Haryana
        </p>
      </div>
    </main>
  );
}

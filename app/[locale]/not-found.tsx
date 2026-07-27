import Link from "next/link";
import { headers } from "next/headers";
import { getDict, isLocale, type Locale } from "@/lib/i18n";

export default async function NotFound() {
  // not-found boundaries receive no params; recover the locale from the URL.
  const h = await headers();
  const referer = h.get("x-invoke-path") ?? "";
  const locale: Locale = isLocale(referer.split("/")[1]) ? (referer.split("/")[1] as Locale) : "en";
  const dict = getDict(locale);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-7xl text-saffron-300">404</p>
      <h1 className="font-display mt-4 text-3xl text-ink">{dict.notFound.title}</h1>
      <p className="mt-3 text-ink-soft">{dict.notFound.text}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 rounded-full bg-saffron-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-saffron-700"
      >
        {dict.common.cta.backToHome}
      </Link>
    </div>
  );
}
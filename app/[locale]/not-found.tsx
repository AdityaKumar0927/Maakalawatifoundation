import Link from "next/link";
import { cookies, headers } from "next/headers";
import { getDict, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export default async function NotFound() {
  // not-found boundaries receive no params; recover the locale from the
  // x-pathname header set by proxy.ts, falling back to the locale cookie.
  const [h, jar] = await Promise.all([headers(), cookies()]);
  const fromPath = (h.get("x-pathname") ?? "").split("/")[1];
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(fromPath)
    ? fromPath
    : isLocale(fromCookie)
      ? fromCookie
      : "en";
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
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { fontVariables } from "@/lib/fonts";
import { getDict, isLocale } from "@/lib/i18n";
import { appOrigin } from "@/lib/env";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import "@/app/globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDict(locale);
  return {
    metadataBase: new URL(appOrigin()),
    title: {
      default: `${dict.common.siteName} — ${dict.common.slogan}`,
      template: `%s · ${dict.common.siteName}`,
    },
    description: dict.common.footer.aboutBlurb,
    alternates: {
      languages: { en: "/en", hi: "/hi" },
    },
    openGraph: {
      siteName: dict.common.siteName,
      title: `${dict.common.siteName} — ${dict.common.slogan}`,
      description: dict.common.footer.aboutBlurb,
      type: "website",
      locale: locale === "hi" ? "hi_IN" : "en_IN",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lift"
        >
          {dict.common.a11y.skipToContent}
        </a>
        <AnnouncementBar locale={locale} label={dict.common.misc.announcement} />
        <Header locale={locale} dict={dict} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  );
}
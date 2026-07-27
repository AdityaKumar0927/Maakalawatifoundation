import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { LogoWordmark } from "@/components/site/Logo";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { MobileMenu } from "@/components/site/MobileMenu";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const base = `/${locale}`;
  const nav = [
    { href: `${base}/about`, label: dict.common.nav.about },
    { href: `${base}/work`, label: dict.common.nav.work },
    { href: `${base}/events`, label: dict.common.nav.events },
    { href: `${base}/contact`, label: dict.common.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream-100/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:h-[4.5rem]">
        <Link href={base} className="shrink-0" aria-label={dict.common.siteName}>
          <LogoWordmark locale={locale} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle
            locale={locale}
            switchToHindi={dict.common.a11y.switchToHindi}
            switchToEnglish={dict.common.a11y.switchToEnglish}
          />
          <Link
            href={`${base}/donate`}
            className="hidden rounded-full bg-saffron-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-saffron-700 sm:inline-flex"
          >
            {dict.common.cta.donate}
          </Link>
          <MobileMenu
            openLabel={dict.common.a11y.openMenu}
            closeLabel={dict.common.a11y.closeMenu}
            items={[
              ...nav,
              { href: `${base}/register-patient`, label: dict.common.nav.registerPatient },
              { href: `${base}/donate`, label: dict.common.nav.donate },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
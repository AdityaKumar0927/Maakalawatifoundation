import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";
import { getContent } from "@/lib/content";
import { getMedia } from "@/lib/media";
import { LogoWordmark } from "@/components/site/Logo";

function SocialIcon({ kind }: { kind: "facebook" | "instagram" | "youtube" }) {
  const paths = {
    facebook:
      "M13.5 9H15V6.5h-1.9C10.9 6.5 10 8 10 9.7V11H8v2.5h2V20h2.6v-6.5h2l.4-2.5h-2.4V10c0-.7.3-1 .9-1Z",
    instagram:
      "M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4ZM16.8 8.4a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0ZM12 6.5c-1.5 0-2.5 0-3.3.3a3.3 3.3 0 0 0-1.9 1.9C6.5 9.5 6.5 10.5 6.5 12s0 2.5.3 3.3a3.3 3.3 0 0 0 1.9 1.9c.8.3 1.8.3 3.3.3s2.5 0 3.3-.3a3.3 3.3 0 0 0 1.9-1.9c.3-.8.3-1.8.3-3.3s0-2.5-.3-3.3a3.3 3.3 0 0 0-1.9-1.9c-.8-.3-1.8-.3-3.3-.3Z",
    youtube:
      "M18.6 9.1a1.7 1.7 0 0 0-1.2-1.2C16.3 7.6 12 7.6 12 7.6s-4.3 0-5.4.3a1.7 1.7 0 0 0-1.2 1.2C5.1 10.2 5.1 12 5.1 12s0 1.8.3 2.9c.16.6.63 1 1.2 1.2 1.1.3 5.4.3 5.4.3s4.3 0 5.4-.3a1.7 1.7 0 0 0 1.2-1.2c.3-1.1.3-2.9.3-2.9s0-1.8-.3-2.9ZM10.6 14.2V9.8l3.6 2.2-3.6 2.2Z",
  } as const;
  return (
    <svg width="24" height="24" viewBox="2 2 20 20" fill="currentColor" aria-hidden>
      <path d={paths[kind]} />
    </svg>
  );
}

export async function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [settings, copy, media] = await Promise.all([
    getSettings(),
    getContent(locale),
    getMedia(),
  ]);
  const logo = media.get("logo");
  const base = `/${locale}`;
  const f = dict.common.footer;
  const year = String(new Date().getFullYear());

  const quickLinks = [
    { href: `${base}/about`, label: dict.common.nav.about },
    { href: `${base}/work`, label: dict.common.nav.work },
    { href: `${base}/events`, label: dict.common.nav.events },
    { href: `${base}/register-patient`, label: dict.common.nav.registerPatient },
    { href: `${base}/donate`, label: dict.common.nav.donate },
    { href: `${base}/contact`, label: dict.common.nav.contact },
  ];

  const socials = (
    [
      ["facebook", settings.facebook],
      ["instagram", settings.instagram],
      ["youtube", settings.youtube],
    ] as const
  ).filter(([, url]) => !!url);

  return (
    <footer className="border-t border-line bg-cream-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <LogoWordmark locale={locale} logoUrl={logo?.url} logoAlt={logo?.alt} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{f.aboutBlurb}</p>
          <p className="font-display mt-4 text-sm text-saffron-700">{dict.common.slogan}</p>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-3">
              {socials.map(([kind, url]) => (
                <a
                  key={kind}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${kind} (${dict.common.a11y.externalLink})`}
                  className="text-ink-faint transition hover:text-saffron-700"
                >
                  <SocialIcon kind={kind} />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label={f.quickLinks}>
          <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">{f.quickLinks}</h2>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ink-soft transition hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">{f.getInTouch}</h2>
          <address className="mt-4 space-y-3 text-sm text-ink-soft not-italic">
            <p className="whitespace-pre-line">{copy["contact.address"]}</p>
            <p>
              <span className="font-medium text-ink">{f.phone}: </span>
              <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="hover:text-ink">
                {settings.phone}
              </a>
            </p>
            {settings.email && (
              <p>
                <span className="font-medium text-ink">{f.email}: </span>
                <a href={`mailto:${settings.email}`} className="hover:text-ink">
                  {settings.email}
                </a>
              </p>
            )}
            {settings.officeHours && (
              <p>
                <span className="font-medium text-ink">{f.officeHours}: </span>
                {settings.officeHours}
              </p>
            )}
          </address>
        </div>

        <div>
          <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">{f.legal}</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href={`${base}/privacy`} className="text-ink-soft transition hover:text-ink">
                {f.privacy}
              </Link>
            </li>
            <li>
              <Link href={`${base}/terms`} className="text-ink-soft transition hover:text-ink">
                {f.terms}
              </Link>
            </li>
          </ul>
          {(settings.grievanceName || settings.grievanceEmail) && (
            <div className="mt-5 rounded-xl border border-line bg-white p-4 text-sm">
              <p className="font-semibold text-ink">{f.dataGrievance}</p>
              {settings.grievanceName && <p className="mt-1 text-ink-soft">{settings.grievanceName}</p>}
              {settings.grievanceEmail && (
                <a href={`mailto:${settings.grievanceEmail}`} className="text-saffron-700 hover:underline">
                  {settings.grievanceEmail}
                </a>
              )}
              {settings.grievancePhone && <p className="text-ink-soft">{settings.grievancePhone}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>{f.rights.replace("{year}", year)}</p>
          {(settings.regLine || settings.taxLine) && (
            <p className="max-w-xl">
              {[settings.regLine, settings.taxLine].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

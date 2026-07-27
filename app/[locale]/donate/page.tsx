import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getContent } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { getMedia } from "@/lib/media";
import { SectionHeading } from "@/components/site/Section";
import { CopyButton } from "@/components/site/CopyButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDict(locale).donate.title };
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDict(locale);
  const d = dict.donate;
  const [copy, settings, media] = await Promise.all([
    getContent(locale),
    getSettings(),
    getMedia(),
  ]);
  const qr = media.get("donateQr");

  const gatewayNote = settings.paymentGatewayName
    ? d.linkTextGateway.replace("{gateway}", settings.paymentGatewayName)
    : "";
  const linkText = d.linkText.replace("{gateway}", gatewayNote);

  const tiers = ([1, 2, 3] as const)
    .map((i) => ({
      amount: copy[`donate.impact${i}.amount`],
      text: copy[`donate.impact${i}.text`],
    }))
    .filter((t) => t.amount && t.text);

  const faqs = [
    { q: d.faq1q, a: d.faq1a },
    { q: d.faq2q, a: d.faq2a },
    { q: d.faq3q, a: d.faq3a },
    { q: d.faq4q, a: d.faq4a },
  ];

  return (
    <>
      <section className="border-b border-line bg-cream-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20">
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{d.title}</h1>
          <p className="mt-5 text-xl leading-relaxed text-ink-soft">{copy["donate.intro"]}</p>
          {settings.taxLine && (
            <p className="mt-5 inline-block rounded-full border border-forest-200 bg-forest-50 px-4 py-1.5 text-sm font-medium text-forest-800">
              {settings.taxLine}
            </p>
          )}
        </div>
      </section>

      {/* ── Impact tiers ─────────────────────────────────────────────── */}
      {tiers.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
          <SectionHeading center title={d.impactHeading} />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.amount}
                className="rounded-2xl border border-line bg-white p-6 text-center shadow-soft"
              >
                <p className="font-display text-3xl text-saffron-700">{t.amount}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Ways to give ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <SectionHeading center title={d.waysHeading} />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Online */}
          <div className="flex flex-col rounded-3xl border-2 border-saffron-200 bg-white p-8 shadow-soft">
            <h3 className="font-display text-2xl text-ink">{d.linkHeading}</h3>
            {settings.paymentUrl ? (
              <>
                <p className="mt-3 leading-relaxed text-ink-soft">{linkText}</p>
                <a
                  href={settings.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-saffron-600 px-8 py-4 text-center font-semibold text-white shadow-soft transition hover:bg-saffron-700"
                >
                  {d.linkButton}
                  <span className="sr-only"> ({dict.common.a11y.externalLink})</span>
                </a>
                <p className="mt-3 text-sm text-ink-faint">{d.externalNote}</p>
              </>
            ) : (
              <p className="mt-3 leading-relaxed text-ink-soft">{d.linkDisabled}</p>
            )}
            <p className="mt-auto pt-5 text-sm font-medium text-forest-700">{d.receiptPromise}</p>
          </div>

          {/* UPI */}
          {(settings.upiVpa || qr) && (
            <div className="rounded-3xl border border-line bg-white p-8 shadow-soft">
              <h3 className="font-display text-2xl text-ink">{d.upiHeading}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{d.upiText}</p>
              {settings.upiVpa && (
                <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-forest-50 p-4">
                  <code className="text-lg font-semibold break-all text-forest-800">
                    {settings.upiVpa}
                  </code>
                  <CopyButton value={settings.upiVpa} label={d.upiCopy} copiedLabel={d.upiCopied} />
                </div>
              )}
              {qr && (
                <div className="mt-5 flex justify-center">
                  <Image
                    src={qr.url}
                    alt={qr.alt || "UPI QR"}
                    width={220}
                    height={220}
                    className="rounded-2xl border border-line"
                  />
                </div>
              )}
              <p className="mt-5 text-sm leading-relaxed text-ink-faint">{d.upiReceipt}</p>
            </div>
          )}

          {/* Offline */}
          <div className="rounded-3xl border border-line bg-cream-50 p-8 lg:col-span-2">
            <h3 className="font-display text-2xl text-ink">{d.offlineHeading}</h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{d.offlineText}</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-cream-50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <SectionHeading center title={d.faqHeading} />
          <div className="mt-8 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-line bg-white p-5 shadow-soft"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                  {f.q}
                  <span
                    aria-hidden
                    className="text-saffron-600 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
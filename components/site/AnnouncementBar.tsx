import type { Locale } from "@/lib/i18n";
import { getActiveAnnouncements } from "@/lib/public-data";

export async function AnnouncementBar({ locale, label }: { locale: Locale; label: string }) {
  const announcements = await getActiveAnnouncements();
  if (announcements.length === 0) return null;
  const top = announcements[0];
  if (!top) return null;
  const title = locale === "hi" ? top.titleHi : top.titleEn;
  const body = locale === "hi" ? top.bodyHi : top.bodyEn;

  return (
    <div className="border-b border-saffron-200 bg-saffron-50">
      <p className="mx-auto flex max-w-6xl items-baseline gap-2 px-4 py-2.5 text-sm text-saffron-900 sm:px-6">
        <span
          aria-label={label}
          className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-saffron-600 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-white uppercase"
        >
          {label}
        </span>
        <span className="min-w-0">
          <span className="font-semibold">{title}</span>
          {body && <span className="text-saffron-800"> — {body}</span>}
        </span>
      </p>
    </div>
  );
}
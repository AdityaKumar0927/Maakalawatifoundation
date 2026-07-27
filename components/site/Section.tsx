import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  sub,
  center,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-sm font-semibold tracking-wide text-saffron-700 uppercase">{eyebrow}</p>
      )}
      <h2 className="font-display text-balance mt-2 text-3xl text-ink sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-lg leading-relaxed text-ink-soft">{sub}</p>}
    </div>
  );
}

export function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-700 transition hover:text-saffron-800"
    >
      {label}
      <span className="transition-transform group-hover:translate-x-1" aria-hidden>
        →
      </span>
    </Link>
  );
}
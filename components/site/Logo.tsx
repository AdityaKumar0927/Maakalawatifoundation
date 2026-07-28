/**
 * The Foundation's mark: a lotus held in a cupped hand — care that lifts.
 * Pure inline SVG, no asset request, scales crisply everywhere.
 */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      <circle cx="24" cy="24" r="23" fill="#fef7ee" stroke="#f3b375" />
      {/* side petals */}
      <path
        d="M24 30c-6.5-2-10-6.8-10.5-12.5 5 .6 8.8 3.2 10.5 7.5 1.7-4.3 5.5-6.9 10.5-7.5C34 23.2 30.5 28 24 30Z"
        fill="#ec8d40"
      />
      {/* centre petal */}
      <path
        d="M24 12c2.6 3 3.9 6.2 3.9 9.4 0 3.3-1.3 5.9-3.9 7.9-2.6-2-3.9-4.6-3.9-7.9 0-3.2 1.3-6.4 3.9-9.4Z"
        fill="#c85312"
      />
      {/* cupped hand */}
      <path
        d="M11 32.5c4 3.4 8.3 5.1 13 5.1s9-1.7 13-5.1"
        stroke="#2e6749"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoWordmark({
  locale,
  size = 40,
  logoUrl,
  logoAlt,
}: {
  locale: "en" | "hi";
  size?: number;
  /** Admin-uploaded logo (MediaSlot "logo"); falls back to the built-in mark. */
  logoUrl?: string | null;
  logoAlt?: string;
}) {
  return (
    <span className="flex items-center gap-3">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={logoAlt || ""}
          className="object-contain"
          style={{ height: size, width: "auto", maxWidth: size * 2.5 }}
        />
      ) : (
        <Logo size={size} />
      )}
      {locale === "hi" ? (
        <span lang="hi" className="font-display text-xl leading-tight text-ink">
          माँ कलावती फ़ाउंडेशन
        </span>
      ) : (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold text-ink">
            Maa Kalawati
          </span>
          <span className="mt-0.5 text-[0.65rem] font-semibold tracking-[0.28em] text-saffron-700 uppercase">
            Foundation
          </span>
        </span>
      )}
    </span>
  );
}

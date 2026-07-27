"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileMenu({
  items,
  openLabel,
  closeLabel,
}: {
  items: Array<{ href: string; label: string }>;
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          {open ? (
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          aria-label="Mobile"
          className="absolute inset-x-0 top-full border-b border-line bg-cream-50 shadow-lift"
        >
          <ul className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            {items.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3.5 text-base font-medium text-ink ${
                    i === 0 ? "" : "border-t border-line/70"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
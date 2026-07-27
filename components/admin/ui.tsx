import Link from "next/link";
import { cn } from "@/lib/utils";

/** Small server-renderable admin UI primitives. */

export const inputCls =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-saffron-400 focus:outline-none focus:ring-2 focus:ring-saffron-200";

export function AdminPage({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink sm:text-3xl">{title}</h1>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white p-6 shadow-soft", className)}>
      {children}
    </div>
  );
}

export function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
      {children}
      {optional && <span className="ml-1 font-normal text-ink-faint">(optional)</span>}
    </label>
  );
}

export function SavedBanner({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="mb-5 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm font-medium text-forest-800"
    >
      ✓ {message}
    </p>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mb-5 rounded-xl border border-cat-health/30 bg-cat-health-soft px-4 py-3 text-sm font-medium text-cat-health"
    >
      {message}
    </p>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line bg-cream-50 p-8 text-center text-sm text-ink-faint">
      {children}
    </p>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full bg-saffron-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-saffron-700"
    >
      {children}
    </Link>
  );
}

export const primaryBtnCls =
  "inline-flex rounded-full bg-saffron-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-saffron-700 disabled:opacity-60";
export const secondaryBtnCls =
  "inline-flex rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:text-ink";
export const dangerBtnCls =
  "inline-flex rounded-full border border-cat-health/40 bg-white px-5 py-2.5 text-sm font-semibold text-cat-health transition hover:bg-cat-health-soft";

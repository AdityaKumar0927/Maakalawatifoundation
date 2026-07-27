import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/locales";

/**
 * Security and routing proxy (Next.js 16 replacement for middleware):
 *
 * 1. Generates a per-request CSP nonce (strict-dynamic; Trusted Types
 *    enforcement runs in report-only until verified in production).
 * 2. Locale routing: `/` shows the language chooser on first visit, then
 *    remembers the choice; bare public paths redirect into /{locale}/...
 * 3. Admin gate: /admin/* (except login/setup) requires the presence of the
 *    session cookie. This is only a cheap outer fence — real session
 *    verification happens server-side in the admin layout, every server
 *    action and every admin route handler (deny by default).
 */

const ADMIN_OPEN_PREFIXES = ["/admin/login", "/admin/setup"];

/** Path prefixes that must never be locale-prefixed. */
const NON_LOCALE_PREFIXES = ["/en", "/hi", "/admin", "/api", "/set-locale"];

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function buildCsp(nonce: string, isAdminArea: boolean): string {
  const dev = process.env.NODE_ENV === "development";
  const directives = [
    `default-src 'self'`,
    // strict-dynamic: only nonce'd scripts (and what they load) may run.
    // wasm-unsafe-eval is needed solely for the self-hosted Tesseract OCR
    // engine, so it is granted only inside the admin area.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isAdminArea ? " 'wasm-unsafe-eval'" : ""}${dev ? " 'unsafe-eval'" : ""}`,
    // React/Next set inline style attributes (e.g. next/image); external
    // styles remain self-hosted only.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://*.public.blob.vercel-storage.com`,
    `font-src 'self'`,
    `connect-src 'self' blob:`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `media-src 'self'`,
    `object-src 'none'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ];
  if (!dev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ── Locale routing (public site only) ─────────────────────────────────
  if (pathname === "/") {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    if (isLocale(saved)) {
      return NextResponse.redirect(new URL(`/${saved}`, request.url));
    }
    // fall through: render the language chooser at "/"
  } else if (!NON_LOCALE_PREFIXES.some((p) => hasPrefix(pathname, p))) {
    // Bare public path (e.g. /about) → send into the visitor's locale.
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(saved) ? saved : "en";
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // ── Admin outer fence ─────────────────────────────────────────────────
  if (
    pathname.startsWith("/admin") &&
    !ADMIN_OPEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    const hasSessionCookie = request.cookies.has("__Host-mkf_session");
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // ── CSP with per-request nonce ────────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isAdminArea = pathname.startsWith("/admin");
  const csp = buildCsp(nonce, isAdminArea);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Lets error boundaries (e.g. the 404 page) recover the request's locale.
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  // Observe Trusted Types compatibility before enforcing (DOM-XSS defence).
  response.headers.set(
    "Content-Security-Policy-Report-Only",
    "require-trusted-types-for 'script'"
  );
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|ocr/|images/|fonts/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

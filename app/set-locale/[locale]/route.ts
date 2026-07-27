import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, isLocale } from "@/lib/locales";

/**
 * Remember the visitor's language and continue. Only "en" / "hi" are
 * accepted and only same-site relative paths are followed, so this cannot
 * become an open redirect.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const nextParam = request.nextUrl.searchParams.get("next") ?? "";
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.includes("\\")
      ? nextParam
      : `/${locale}`;

  const response = NextResponse.redirect(new URL(safeNext, request.url));
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

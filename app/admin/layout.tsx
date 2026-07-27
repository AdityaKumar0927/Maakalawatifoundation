import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Admin · Maa Kalawati Foundation",
    template: "%s · Admin · Maa Kalawati Foundation",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  width: "device-width",
  initialScale: 1,
};

/** Root layout for the admin area (login/setup + panel). English-only. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Maa Kalawati Foundation · माँ कलावती फ़ाउंडेशन",
  description:
    "We care, we serve, we empower. A charitable foundation in Gurugram for healthcare support, education, women empowerment and community welfare.",
};

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  width: "device-width",
  initialScale: 1,
};

export default function ChooserLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
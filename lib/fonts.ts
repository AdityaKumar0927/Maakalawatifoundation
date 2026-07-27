import { Fraunces, Mukta, Tiro_Devanagari_Hindi } from "next/font/google";

/**
 * Type system:
 * - Fraunces (variable serif) — English display headings.
 * - Tiro Devanagari Hindi — Hindi display headings (single 400 weight, set
 *   large; the most refined open-licence Devanagari serif available).
 * - Mukta — body for BOTH languages: its Latin and Devanagari are drawn
 *   together, so bilingual text shares one baseline without size hacks.
 */

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mukta",
  display: "swap",
});

export const tiro = Tiro_Devanagari_Hindi({
  subsets: ["latin", "devanagari"],
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
  preload: false,
});

export const fontVariables = `${fraunces.variable} ${mukta.variable} ${tiro.variable}`;

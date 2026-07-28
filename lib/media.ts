import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Named image slots the admin can fill via upload. When a slot is empty the
 * site falls back to its built-in artwork, so the design never breaks.
 */

export interface MediaSlotDef {
  key: string;
  label: string;
  help?: string;
  /** Preview without cropping (logos, QR codes). */
  contain?: boolean;
}

export const mediaSlotDefs: MediaSlotDef[] = [
  {
    key: "logo",
    label: "Site logo",
    help: "Shown beside the foundation's name in the header and footer, and on the language page. A square emblem on a transparent background (PNG) works best — the name is already displayed as text next to it. Leave empty to use the built-in lotus mark.",
    contain: true,
  },
  { key: "hero", label: "Homepage hero photo", help: "A real photo from your work — landscape, at least 1600px wide." },
  { key: "story", label: "Story spotlight photo", help: "Photo of the person featured in the homepage story." },
  { key: "about", label: "About page photo" },
  {
    key: "donateQr",
    label: "UPI QR code",
    help: "The QR image from your bank/UPI app, shown on the donate page.",
    contain: true,
  },
];

export const mediaSlotKeySet = new Set(mediaSlotDefs.map((d) => d.key));

export type MediaMap = Map<string, { url: string; alt: string }>;

export const getMedia = cache(async (): Promise<MediaMap> => {
  try {
    const rows = await prisma.mediaSlot.findMany();
    return new Map(rows.map((r) => [r.key, { url: r.url, alt: r.alt }]));
  } catch {
    return new Map();
  }
});

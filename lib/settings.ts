import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";

/**
 * Non-bilingual site configuration, stored as key/value Setting rows.
 * Everything here is optional — empty values simply hide the related UI —
 * except phone, which defaults to the foundation's landline.
 */

export interface SettingDef {
  key: string;
  label: string;
  help?: string;
  defaultValue: string;
  /** "url" enforces https URLs; "email"/"phone"/"upi" get format checks. */
  kind: "text" | "url" | "email" | "phone" | "upi";
}

export const settingDefs = [
  {
    key: "paymentUrl",
    label: "Donation payment link",
    help: "The secure https payment page donations are sent to (e.g. a Razorpay Payment Page). The Donate button is disabled until this is set.",
    defaultValue: "",
    kind: "url",
  },
  {
    key: "paymentGatewayName",
    label: "Payment provider name",
    help: "Shown to donors before the redirect, e.g. “Razorpay”.",
    defaultValue: "",
    kind: "text",
  },
  {
    key: "upiVpa",
    label: "UPI ID (VPA) for direct donations",
    help: "e.g. maakalawati@sbi — shown with a copy button on the donate page.",
    defaultValue: "",
    kind: "upi",
  },
  {
    key: "taxLine",
    label: "Tax-deduction line (80G)",
    help: "e.g. “Donations are eligible for 50% tax deduction under Section 80G.” Leave empty until the 80G approval is in hand.",
    defaultValue: "",
    kind: "text",
  },
  {
    key: "regLine",
    label: "Registration line",
    help: "e.g. “Registered charitable trust · Reg. no. …”. Shown in the footer once set.",
    defaultValue: "",
    kind: "text",
  },
  { key: "email", label: "Contact email", defaultValue: "", kind: "email" },
  { key: "phone", label: "Phone number", defaultValue: "0124-4268181", kind: "phone" },
  {
    key: "officeHours",
    label: "Office hours",
    help: "e.g. “Mon–Sat, 10:00 AM – 6:00 PM”",
    defaultValue: "",
    kind: "text",
  },
  {
    key: "mapsUrl",
    label: "Google Maps link",
    defaultValue: "",
    kind: "url",
  },
  {
    key: "grievanceName",
    label: "Data grievance contact — name",
    help: "DPDP Rule 9 requires publishing a contact person for data questions.",
    defaultValue: "",
    kind: "text",
  },
  { key: "grievanceEmail", label: "Data grievance contact — email", defaultValue: "", kind: "email" },
  { key: "grievancePhone", label: "Data grievance contact — phone", defaultValue: "", kind: "phone" },
  {
    key: "responseDays",
    label: "Published grievance response time (days)",
    help: "DPDP allows at most 90 days; a short promise builds trust.",
    defaultValue: "15",
    kind: "text",
  },
  { key: "facebook", label: "Facebook page URL", defaultValue: "", kind: "url" },
  { key: "instagram", label: "Instagram URL", defaultValue: "", kind: "url" },
  { key: "youtube", label: "YouTube URL", defaultValue: "", kind: "url" },
] as const satisfies readonly SettingDef[];

export type SettingKey = (typeof settingDefs)[number]["key"];
export type Settings = Record<SettingKey, string>;

/** Wide-typed view for consumers that read optional fields (e.g. help). */
export const settingDefList: readonly SettingDef[] = settingDefs;

export const settingKeySet: ReadonlySet<string> = new Set(settingDefs.map((d) => d.key));

export const getSettings = cache(async (): Promise<Settings> => {
  const out = Object.fromEntries(
    settingDefs.map((def) => [def.key, def.defaultValue])
  ) as Record<SettingKey, string>;
  try {
    const rows = await prisma.setting.findMany();
    for (const row of rows) {
      if (settingKeySet.has(row.key) && row.value) out[row.key as SettingKey] = row.value;
    }
  } catch {
    // defaults already applied
  }
  return out;
});

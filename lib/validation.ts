import { z } from "zod";

/**
 * Input validation building blocks. Everything that crosses the trust
 * boundary is parsed against an allowlist schema; free text is trimmed,
 * length-capped and stripped of control characters. Nothing collected from
 * the public is ever rendered as HTML — always as plain text.
 */

// Strip C0 control characters (except tab and newline) and DEL.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value: string): string {
  return value.replace(CONTROL_CHARS, "").replace(/\r\n/g, "\n").trim();
}

export const text = (max: number) =>
  z.string().max(max * 4).transform(cleanText).pipe(z.string().min(1).max(max));

export const optionalText = (max: number) =>
  z
    .string()
    .max(max * 4)
    .optional()
    .default("")
    .transform((v) => cleanText(v ?? ""))
    .pipe(z.string().max(max));

/** Indian mobile or landline, with optional +91/0 prefix. */
export const indianPhone = z
  .string()
  .max(20)
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .pipe(z.string().regex(/^(\+91|0)?[1-9]\d{9}$/, "invalid phone"));

export const httpsUrl = z
  .string()
  .max(500)
  .trim()
  .pipe(z.string().url())
  .refine((v) => v.startsWith("https://"), "must be an https:// URL");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase words separated by dashes").min(3).max(80));

/** Version stamp recorded with each consent (bump when the notice changes). */
export const CONSENT_VERSION = "2026-07-27.v1";

export const patientSchema = z
  .object({
    fullName: text(100),
    age: z.coerce.number().int().min(0).max(120),
    gender: z.enum(["female", "male", "other", "prefer_not"]),
    phone: indianPhone,
    city: optionalText(100),
    address: optionalText(300),
    need: text(1500),
    preferredLanguage: z.enum(["hi", "en"]),
    consent: z.literal("on"),
    guardianName: optionalText(100),
    guardianRelation: optionalText(50),
    guardianPhone: z.string().max(20).optional().default(""),
    guardianIdType: optionalText(40),
    guardianIdRef: optionalText(40),
    guardianConsent: z.string().optional().default(""),
    // Anti-bot: honeypot must stay empty; the form must take >3s to submit.
    website: z.string().max(0),
    startedAt: z.coerce.number(),
  })
  .superRefine((data, ctx) => {
    if (data.age < 18) {
      if (!data.guardianName) {
        ctx.addIssue({ code: "custom", path: ["guardianName"], message: "guardian required" });
      }
      if (!data.guardianRelation) {
        ctx.addIssue({ code: "custom", path: ["guardianRelation"], message: "relation required" });
      }
      if (data.guardianConsent !== "on") {
        ctx.addIssue({ code: "custom", path: ["guardianConsent"], message: "guardian consent required" });
      }
      const cleanedGuardianPhone = data.guardianPhone.replace(/[\s\-()]/g, "");
      if (!/^(\+91|0)?[1-9]\d{9}$/.test(cleanedGuardianPhone)) {
        ctx.addIssue({ code: "custom", path: ["guardianPhone"], message: "guardian phone required" });
      }
    }
  });

export type PatientInput = z.infer<typeof patientSchema>;

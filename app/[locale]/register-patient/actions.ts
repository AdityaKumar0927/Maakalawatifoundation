"use server";

import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { CONSENT_VERSION, patientSchema } from "@/lib/validation";
import { isLocale } from "@/lib/locales";

export type PatientFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; code: "validation" | "rate" | "generic"; fields?: string[] };

export async function submitPatientRegistration(
  _prev: PatientFormState,
  formData: FormData
): Promise<PatientFormState> {
  try {
    // Throttle before any work: 5 submissions/hour per (salted, hashed) IP.
    const limit = await rateLimit("patient", 5, 3600);
    if (limit === "limited") return { status: "error", code: "rate" };
    if (limit === "unavailable") return { status: "error", code: "generic" };

    const raw = Object.fromEntries(formData.entries());
    const parsed = patientSchema.safeParse(raw);
    if (!parsed.success) {
      const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0] ?? "")))];
      return { status: "error", code: "validation", fields };
    }
    const data = parsed.data;

    // Anti-bot: humans take longer than 3 seconds; scripted posts carry a
    // missing, future, or impossibly old timestamp.
    const elapsed = Date.now() - data.startedAt;
    if (data.startedAt <= 0 || elapsed < 3000 || elapsed > 24 * 3600 * 1000) {
      return { status: "error", code: "generic" };
    }

    const consentLanguage = isLocale(String(raw.locale)) ? String(raw.locale) : "en";
    const isMinor = data.age < 18;

    const record = await prisma.patientRegistration.create({
      data: {
        fullName: data.fullName,
        age: data.age,
        gender: data.gender,
        phone: data.phone,
        city: data.city,
        address: data.address,
        need: data.need,
        preferredLanguage: data.preferredLanguage,
        guardianName: isMinor ? data.guardianName : null,
        guardianRelation: isMinor ? data.guardianRelation : null,
        guardianPhone: isMinor ? data.guardianPhone.replace(/[\s\-()]/g, "") : null,
        guardianIdType: isMinor && data.guardianIdType ? data.guardianIdType : null,
        guardianIdRef: isMinor && data.guardianIdRef ? data.guardianIdRef.slice(-4) : null,
        consentVersion: CONSENT_VERSION,
        consentLanguage,
      },
    });

    await audit({
      actorEmail: "public",
      action: "patient.register",
      entity: "PatientRegistration",
      entityId: record.id,
      summary: `New medical support request (${consentLanguage}, consent ${CONSENT_VERSION})`,
    });

    return { status: "success" };
  } catch {
    return { status: "error", code: "generic" };
  }
}
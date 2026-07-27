"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { settingDefs } from "@/lib/settings";
import { cleanText, httpsUrl, indianPhone } from "@/lib/validation";

const emailSchema = z.string().trim().toLowerCase().pipe(z.string().email().max(200));
const upiSchema = z
  .string()
  .trim()
  .pipe(z.string().regex(/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/, "invalid UPI ID"));

function validate(kind: string, value: string): string | null {
  if (value === "") return "";
  switch (kind) {
    case "url": {
      const r = httpsUrl.safeParse(value);
      return r.success ? r.data : null;
    }
    case "email": {
      const r = emailSchema.safeParse(value);
      return r.success ? r.data : null;
    }
    case "phone": {
      // Keep the display format the admin typed, but require a valid number.
      return indianPhone.safeParse(value).success ? cleanText(value).slice(0, 20) : null;
    }
    case "upi": {
      const r = upiSchema.safeParse(value);
      return r.success ? r.data : null;
    }
    default:
      return cleanText(value).slice(0, 300);
  }
}

export async function saveSettings(formData: FormData): Promise<void> {
  const user = await requireAdminAction();

  const invalid: string[] = [];
  for (const def of settingDefs) {
    const raw = String(formData.get(def.key) ?? "");
    const value = validate(def.kind, raw);
    if (value === null) {
      invalid.push(def.key);
      continue;
    }
    if (value === "") {
      await prisma.setting.deleteMany({ where: { key: def.key } });
    } else {
      await prisma.setting.upsert({
        where: { key: def.key },
        create: { key: def.key, value },
        update: { value },
      });
    }
  }

  await audit({
    actorEmail: user.email,
    action: "settings.save",
    entity: "Setting",
    summary: invalid.length ? `Saved with invalid fields skipped: ${invalid.join(", ")}` : "Saved",
  });

  redirect(invalid.length ? `/admin/settings?invalid=${invalid.join(",")}` : "/admin/settings?saved=1");
}
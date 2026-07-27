"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requireAdminAction } from "@/lib/guard";
import { contentKeys } from "@/lib/content-keys";
import { cleanText } from "@/lib/validation";

const MAX_LEN = 4000;

export async function saveContentGroup(formData: FormData): Promise<void> {
  const user = await requireAdminAction();
  const group = String(formData.get("group") ?? "");
  const keysInGroup = contentKeys.filter((k) => k.group === group);
  if (keysInGroup.length === 0) redirect("/admin/content?error=1");

  let changed = 0;
  for (const def of keysInGroup) {
    const en = cleanText(String(formData.get(`${def.key}__en`) ?? "")).slice(0, MAX_LEN);
    const hi = cleanText(String(formData.get(`${def.key}__hi`) ?? "")).slice(0, MAX_LEN);
    if (en === "" && hi === "") {
      // Both empty = revert to the built-in default copy.
      await prisma.siteContent.deleteMany({ where: { key: def.key } });
    } else {
      await prisma.siteContent.upsert({
        where: { key: def.key },
        create: { key: def.key, en, hi },
        update: { en, hi },
      });
    }
    changed++;
  }

  await audit({
    actorEmail: user.email,
    action: "content.save",
    entity: "SiteContent",
    summary: `Updated "${group}" (${changed} keys)`,
  });
  redirect("/admin/content?saved=1");
}
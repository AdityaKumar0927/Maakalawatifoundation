import "server-only";
import { prisma } from "@/lib/db";

/**
 * Append-only audit log. Write-only from the app: there is intentionally no
 * code path that updates or deletes rows. DPDP Rule 6 expects security logs
 * retained for about a year; prune older rows directly in the database if
 * ever needed.
 */
export async function audit(entry: {
  actorEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  summary?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorEmail: entry.actorEmail.slice(0, 200),
        action: entry.action.slice(0, 100),
        entity: entry.entity.slice(0, 100),
        entityId: (entry.entityId ?? "").slice(0, 100),
        summary: (entry.summary ?? "").slice(0, 500),
      },
    });
  } catch {
    // Auditing must never take the primary action down with it.
  }
}

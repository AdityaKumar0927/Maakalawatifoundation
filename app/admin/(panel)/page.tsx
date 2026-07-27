import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/guard";
import { getSettings } from "@/lib/settings";
import { AdminPage, Card } from "@/components/admin/ui";

async function safeCount(fn: () => Promise<number>): Promise<number | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export default async function Dashboard() {
  await requireAdminPage();
  const settings = await getSettings();
  const now = new Date();

  const [newPatients, upcomingEvents, publishedProjects, activeAnnouncements, visitors, admins] =
    await Promise.all([
      safeCount(() => prisma.patientRegistration.count({ where: { status: "NEW" } })),
      safeCount(() =>
        prisma.event.count({ where: { published: true, startAt: { gte: now } } })
      ),
      safeCount(() => prisma.project.count({ where: { published: true } })),
      safeCount(() => prisma.announcement.count({ where: { active: true } })),
      safeCount(() => prisma.visitorRecord.count()),
      safeCount(() => prisma.adminUser.count({ where: { active: true } })),
    ]);

  const stats = [
    { label: "New patient requests", value: newPatients, href: "/admin/patients" },
    { label: "Upcoming events", value: upcomingEvents, href: "/admin/events" },
    { label: "Published projects", value: publishedProjects, href: "/admin/projects" },
    { label: "Active announcements", value: activeAnnouncements, href: "/admin/announcements" },
    { label: "Visitor book entries", value: visitors, href: "/admin/visitors" },
    { label: "Administrators", value: admins, href: "/admin/admins" },
  ];

  const checklist = [
    {
      done: !!settings.paymentUrl,
      label: "Add the donation payment link",
      href: "/admin/settings",
    },
    {
      done: !!settings.email,
      label: "Add a contact email",
      href: "/admin/settings",
    },
    {
      done: !!(settings.grievanceName && settings.grievanceEmail),
      label: "Publish the data grievance contact (DPDP)",
      href: "/admin/settings",
    },
    {
      done: !!settings.officeHours,
      label: "Add office hours",
      href: "/admin/settings",
    },
  ].filter((c) => !c.done);

  return (
    <AdminPage title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-lift">
              <p className="font-display text-3xl text-ink">{s.value ?? "—"}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {checklist.length > 0 && (
        <Card className="mt-6 border-saffron-200 bg-saffron-50">
          <h2 className="font-display text-lg text-saffron-900">Finish setting up</h2>
          <ul className="mt-3 space-y-2">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link
                  href={c.href}
                  className="text-sm font-medium text-saffron-800 hover:underline"
                >
                  ○ {c.label} →
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {newPatients === null && (
        <Card className="mt-6 border-cat-health/30 bg-cat-health-soft">
          <p className="text-sm font-medium text-cat-health">
            The database could not be reached. Check DATABASE_URL and run{" "}
            <code>npm run db:push</code> once to create the tables.
          </p>
        </Card>
      )}
    </AdminPage>
  );
}
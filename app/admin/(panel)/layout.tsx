import Link from "next/link";
import { requireAdminPage } from "@/lib/guard";
import { Logo } from "@/components/site/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "@/app/admin/(panel)/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/content", label: "Site content" },
  { href: "/admin/media", label: "Images" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/patients", label: "Patients" },
  { href: "/admin/visitors", label: "Visitor book" },
  { href: "/admin/admins", label: "Administrators" },
  { href: "/admin/audit", label: "Audit log" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Deny by default: every page under the panel re-verifies the session
  // server-side (the proxy cookie check is only an outer fence).
  const user = await requireAdminPage();

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="flex flex-col gap-4 bg-forest-900 p-4 lg:min-h-dvh lg:w-60 lg:shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 pt-1">
          <Logo size={34} />
          <span className="text-sm leading-tight font-semibold text-cream-100">
            Maa Kalawati
            <br />
            <span className="text-xs font-normal text-forest-300">Admin panel</span>
          </span>
        </Link>
        <AdminNav items={NAV} />
        <div className="mt-auto border-t border-forest-800 px-2 pt-3">
          <p className="truncate text-xs text-forest-300">{user.name}</p>
          <p className="truncate text-xs text-forest-400">{user.email}</p>
          <div className="mt-2 flex items-center gap-3">
            <form action={signOut}>
              <button className="text-xs font-semibold text-forest-200 hover:text-white">
                Sign out
              </button>
            </form>
            <Link href="/en" className="text-xs text-forest-300 hover:text-white">
              View site ↗
            </Link>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-cream-100 p-4 sm:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
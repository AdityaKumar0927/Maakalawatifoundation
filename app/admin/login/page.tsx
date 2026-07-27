import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { Logo } from "@/components/site/Logo";
import { PasskeyLogin } from "@/components/admin/PasskeyLogin";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <div className="bg-motif pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative w-full max-w-sm rounded-3xl border border-line bg-white p-8 text-center shadow-lift">
        <div className="flex justify-center">
          <Logo size={56} />
        </div>
        <h1 className="font-display mt-5 text-2xl text-ink">Administrator sign-in</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Sign-in uses passkeys only — no passwords to phish or leak.
        </p>
        <div className="mt-7">
          <PasskeyLogin />
        </div>
        <p className="mt-6 text-xs text-ink-faint">
          First time here?{" "}
          <Link href="/admin/setup" className="font-semibold text-saffron-700 hover:underline">
            Set up the first administrator
          </Link>
        </p>
      </div>
    </main>
  );
}
import Link from "next/link";
import { SiteMark } from "@/components/site/SiteMark";
import { PasskeySetup } from "@/components/admin/PasskeySetup";

export const metadata = { title: "Set up administrator" };

export default async function AdminSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  const inviteToken = typeof invite === "string" && invite.length >= 8 ? invite : null;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <div className="bg-motif pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-lift">
        <div className="flex justify-center">
          <SiteMark size={56} />
        </div>
        <h1 className="font-display mt-5 text-center text-2xl text-ink">
          {inviteToken ? "Accept your admin invitation" : "Set up the first administrator"}
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-ink-soft">
          {inviteToken
            ? "Create your passkey to activate your administrator account."
            : "Enter the setup token from the deployment configuration, then create the owner's passkey."}
        </p>
        <div className="mt-7">
          <PasskeySetup inviteToken={inviteToken} />
        </div>
        <p className="mt-6 text-center text-xs text-ink-faint">
          <Link href="/admin/login" className="font-semibold text-saffron-700 hover:underline">
            Back to sign-in
          </Link>
        </p>
      </div>
    </main>
  );
}
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminCredentialList from "@/components/AdminCredentialList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Pevzner Foundation",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  const isAdmin =
    (session.user as any).isAdmin === true ||
    (session.user.email != null && session.user.email === process.env.ADMIN_EMAIL);

  if (!isAdmin) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      <div className="absolute top-[5%] right-[5%] w-[40%] h-[40%] bg-[rgba(139,92,246,0.06)] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto z-10 relative">
        <div className="flex items-center justify-between mb-8 bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-border)] rounded-full px-6 py-3">
          <h1 className="text-lg font-semibold">
            <span className="text-gradient">Admin</span>
            <span className="text-[var(--color-text-muted)] font-normal ml-2 text-sm">
              — Credential Dashboard
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-text-muted)]">
              {session.user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button className="text-sm text-[var(--color-accent-orange)] hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <AdminCredentialList />
      </div>
    </div>
  );
}

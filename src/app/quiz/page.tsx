import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Quiz from "@/components/Quiz";

export default async function QuizPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth");
  }

  if (!(session.user as any).emailVerified) {
    // If user is logged in but not verified, redirect to auth page with email
    // so they can enter the verification code
    redirect(`/auth?email=${encodeURIComponent(session.user.email || "")}&verify=true`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-[rgba(249,115,22,0.08)] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-[rgba(139,92,246,0.12)] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-2xl z-10 w-full">
        <div className="mb-8 flex justify-between items-center bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-border)] rounded-full px-6 py-3">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            С возвращением, <span className="text-white">{session.user.name || session.user.email}</span>
          </span>
          <form action="/api/auth/signout" method="POST">
            <button className="text-sm text-[var(--color-accent-orange)] hover:underline">
              Выйти
            </button>
          </form>
        </div>
        
        <Quiz />
      </div>
    </div>
  );
}

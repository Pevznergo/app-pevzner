import { auth } from "@/auth";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import ShareForm from "@/components/ShareForm";

export default async function SharePage() {
  const session = await auth();

  // If not authenticated, show the auth form so they can log in / register
  if (!session?.user || !(session.user as any).emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[rgba(139,92,246,0.12)] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[rgba(59,130,246,0.08)] rounded-full blur-[100px] pointer-events-none" />
        <div className="w-full z-10">
          <Suspense fallback={<div className="text-center text-[var(--color-text-muted)]">Loading...</div>}>
            <AuthForm redirectTo="/share" />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[rgba(59,130,246,0.08)] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[rgba(139,92,246,0.12)] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full z-10">
        <ShareForm />
      </div>
    </div>
  );
}

import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[rgba(139,92,246,0.12)] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[rgba(59,130,246,0.08)] rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full z-10">
        <Suspense fallback={<div className="text-center text-[var(--color-text-muted)]">Загрузка...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}

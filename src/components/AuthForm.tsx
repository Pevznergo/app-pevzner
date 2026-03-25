"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, ShieldCheck, Lock, UserPlus, LogIn } from "lucide-react";

type AuthView = "login" | "register" | "verify";

export default function AuthForm() {
  const searchParams = useSearchParams();
  const initialVerify = searchParams.get("verify") === "true";
  const initialEmail = searchParams.get("email") || "";

  const [view, setView] = useState<AuthView>(initialVerify ? "verify" : "login");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (view === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        
        setView("verify");
        setMessage("Аккаунт создан! Пожалуйста, введите код из письма.");
      } else {
        // Login mode
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error === "CredentialsSignin" ? "Неверный пароль" : result.error);
        }

        // Check if user is verified (we store this in session/token)
        // For simplicity, we can redirect to /quiz and let it handle verification check
        // Or we can check here by fetching session or just navigating
        window.location.href = "/quiz";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) return setError("Введите 6-значный код");

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        code,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Неверный код или срок его действия истек");
      }
      
      window.location.href = "/quiz";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto step-card">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {view === "verify" ? "Подтверждение" : view === "register" ? "Регистрация" : "Вход"}
        </h1>
        <p className="text-[var(--color-text-muted)]">
          {view === "verify" 
            ? `Код отправлен на ${email}` 
            : "Введите ваши данные для доступа к платформе"}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-6 text-sm text-center">
          {message}
        </div>
      )}

      {view !== "verify" ? (
        <div className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {loading ? "Загрузка..." : view === "register" ? "Зарегистрироваться" : "Войти"}
              {view === "register" ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setView(view === "login" ? "register" : "login")}
              className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              {view === "login" ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">6-значный код</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg py-3 pl-10 pr-4 text-white text-center tracking-[0.5em] font-mono text-xl focus:outline-none focus:border-[var(--color-accent-purple)] transition-colors"
                required
              />
            </div>
            <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
              Отправлен на {email} <br/>
              <button type="button" onClick={() => setView("login")} className="text-[var(--color-accent-blue)] mt-1 hover:underline">
                Вернуться ко входу
              </button>
            </p>
          </div>
          <button 
            type="submit" 
            disabled={loading || code.length !== 6}
            className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
          >
            {loading ? "Проверка..." : "Подтвердить"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

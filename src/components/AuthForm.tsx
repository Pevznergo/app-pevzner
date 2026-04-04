"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, ShieldCheck, Lock, UserPlus, LogIn } from "lucide-react";

type AuthView = "login" | "register" | "verify";

export default function AuthForm({ redirectTo = "/quiz" }: { redirectTo?: string }) {
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
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const sendCode = async (targetEmail: string) => {
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    return res;
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError("");
    try {
      const res = await sendCode(email);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to resend code");
      }
      setMessage("A new code has been sent to your email.");
      startResendCooldown();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

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
        setMessage("Account created! Please enter the code from your email.");
        startResendCooldown();
      } else {
        // Step 1: pre-check to get a meaningful error and detect unverified users.
        // next-auth v5 does not propagate the original error text out of authorize(),
        // so we call our own endpoint first.
        const checkRes = await fetch("/api/auth/check-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const checkData = await checkRes.json();

        if (!checkRes.ok) {
          throw new Error(checkData.error || "Incorrect email or password");
        }

        if (checkData.status === "UNVERIFIED") {
          // Registered but email not verified — send a new code and switch to verify view
          await sendCode(email);
          setView("verify");
          setMessage("Your email is not verified yet. A new code has been sent.");
          startResendCooldown();
          return;
        }

        // Step 2: credentials are valid and user is verified — proceed with signIn
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Sign in failed. Please try again.");
        }

        window.location.href = redirectTo;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) return setError("Please enter the 6-digit code");

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        code,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid code or it has expired");
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
          {view === "verify" ? "Verification" : view === "register" ? "Sign Up" : "Sign In"}
        </h1>
        <p className="text-[var(--color-text-muted)]">
          {view === "verify" 
            ? `Code sent to ${email}` 
            : "Enter your credentials to access the platform"}
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
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Password</label>
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
              {loading ? "Loading..." : view === "register" ? "Create Account" : "Sign In"}
              {view === "register" ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setView(view === "login" ? "register" : "login")}
              className="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              {view === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">6-digit code</label>
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
            <div className="text-xs text-[var(--color-text-muted)] text-center mt-3 space-y-2">
              <p>Sent to <span className="text-white">{email}</span></p>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-[var(--color-accent-blue)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {resendLoading
                    ? "Sending..."
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend code"}
                </button>
                <span className="opacity-30">|</span>
                <button type="button" onClick={() => setView("login")} className="hover:text-white transition-colors">
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading || code.length !== 6}
            className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
          >
            {loading ? "Verifying..." : "Confirm"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

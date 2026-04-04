"use client";

import { useState } from "react";
import { Globe, Lock, User, CheckSquare, ChevronDown, Eye, EyeOff, Send, CheckCircle } from "lucide-react";

const PORTALS = [
  { value: "aws", label: "Amazon Web Services (AWS)" },
  { value: "google-vertex", label: "Google Cloud / Vertex AI" },
  { value: "azure", label: "Microsoft Azure" },
  { value: "replit", label: "Replit" },
  { value: "custom", label: "Other / Custom" },
] as const;

type PortalValue = (typeof PORTALS)[number]["value"];

export default function ShareForm() {
  const [portal, setPortal] = useState<PortalValue | "">("");
  const [portalLabel, setPortalLabel] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canSubmit = portal !== "" && username.trim() !== "" && password.trim() !== "" &&
    consentChecked && (portal !== "custom" || portalLabel.trim() !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/share/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portal,
          portalLabel: portal === "custom" ? portalLabel.trim() : undefined,
          username: username.trim(),
          password,
          consentChecked: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto step-card text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Credentials Received</h2>
        <p className="text-[var(--color-text-muted)] mb-6">
          Your access credentials have been securely saved. Our team will review them
          and reach out within 24 hours to confirm the next steps.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setPortal("");
            setPortalLabel("");
            setUsername("");
            setPassword("");
            setConsentChecked(false);
          }}
          className="btn-secondary w-full"
        >
          Submit another portal
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto step-card">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Share Access</h1>
        <p className="text-[var(--color-text-muted)]">
          Provide your portal credentials so our team can complete tasks on your behalf.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Portal selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Portal / Service
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <select
              value={portal}
              onChange={(e) => setPortal(e.target.value as PortalValue)}
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg py-3 pl-10 pr-10 text-white appearance-none focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              required
            >
              <option value="" disabled className="bg-[#0a0a14]">
                Select a portal...
              </option>
              {PORTALS.map((p) => (
                <option key={p.value} value={p.value} className="bg-[#0a0a14]">
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Custom portal name */}
        {portal === "custom" && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
              Portal Name
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={portalLabel}
                onChange={(e) => setPortalLabel(e.target.value)}
                placeholder="e.g. Heroku, DigitalOcean, Vercel..."
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                required
              />
            </div>
          </div>
        )}

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Login / Username / Email
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your@email.com or username"
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg py-3 pl-10 pr-12 text-white focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Clickwrap consent */}
        <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[var(--color-glass-border)] rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--color-accent-blue)] cursor-pointer"
                // NOTE: defaultChecked is NOT set. Per US clickwrap law, the user must manually check this.
              />
            </div>
            <span className="text-sm text-white leading-relaxed">
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent-blue)] hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent-blue)] hover:underline"
              >
                Privacy Policy
              </a>
              , and I explicitly authorize Pevzner Foundation to access, log in to, and manage
              my accounts in the specified third-party services on my behalf for the purposes
              of providing tax credit services.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? "Submitting..." : "Submit Credentials"}
          {!loading && <Send className="w-4 h-4" />}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
        Your password is encrypted with AES-256 before storage.
      </p>
    </div>
  );
}

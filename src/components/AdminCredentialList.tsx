"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy, Check, RefreshCw } from "lucide-react";

type Credential = {
  id: string;
  portal: string;
  portalLabel: string | null;
  username: string;
  password: string;
  createdAt: string;
  userEmail: string | null;
  userName: string | null;
  latestConsent: {
    timestamp: string;
    ipAddress: string;
    documentVersion: string;
  } | null;
};

const PORTAL_NAMES: Record<string, string> = {
  aws: "AWS",
  "google-vertex": "Google Vertex",
  azure: "Azure",
  replit: "Replit",
  custom: "Custom",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 text-[var(--color-text-muted)] hover:text-white transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function PasswordCell({ password }: { password: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      <span className={visible ? "" : "tracking-widest select-none"}>
        {visible ? password : "••••••••"}
      </span>
      <button
        onClick={() => setVisible(!visible)}
        className="text-[var(--color-text-muted)] hover:text-white transition-colors"
        title={visible ? "Hide" : "Reveal"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      {visible && <CopyButton text={password} />}
    </div>
  );
}

export default function AdminCredentialList() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCredentials = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/credentials");
      if (!res.ok) throw new Error("Failed to load credentials");
      const data = await res.json();
      setCredentials(data.credentials);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-[var(--color-text-muted)]">
        Loading credentials...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="step-card text-center py-16">
        <p className="text-[var(--color-text-muted)] text-lg">No credentials submitted yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[var(--color-text-muted)] text-sm">
          {credentials.length} credential{credentials.length !== 1 ? "s" : ""} total
        </p>
        <button
          onClick={fetchCredentials}
          className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {credentials.map((cred) => (
          <div key={cred.id} className="step-card hover:transform-none">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-[rgba(139,92,246,0.2)] text-purple-300 border border-purple-500/30">
                    {cred.portal === "custom" && cred.portalLabel
                      ? cred.portalLabel
                      : PORTAL_NAMES[cred.portal] ?? cred.portal}
                  </span>
                </div>
                <p className="text-white font-medium">{cred.userEmail ?? "—"}</p>
                {cred.userName && (
                  <p className="text-[var(--color-text-muted)] text-sm">{cred.userName}</p>
                )}
              </div>
              <div className="text-right text-xs text-[var(--color-text-muted)]">
                <p>Submitted: {new Date(cred.createdAt).toLocaleString()}</p>
                {cred.latestConsent && (
                  <>
                    <p>Consent: {new Date(cred.latestConsent.timestamp).toLocaleString()}</p>
                    <p>IP: {cred.latestConsent.ipAddress}</p>
                    <p>ToS: {cred.latestConsent.documentVersion}</p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-glass-border)] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Username / Login</p>
                <div className="flex items-center gap-1 font-mono text-sm text-white">
                  <span>{cred.username}</span>
                  <CopyButton text={cred.username} />
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Password</p>
                <PasswordCell password={cred.password} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

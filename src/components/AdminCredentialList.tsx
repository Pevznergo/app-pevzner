"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, Copy, Check, RefreshCw, CheckCircle, Archive, AlertTriangle, Ban } from "lucide-react";

type Credential = {
  id: string;
  portal: string;
  portalLabel: string | null;
  username: string;
  password: string;
  status: string;
  isDuplicate: boolean;
  totalPortals: number;
  createdAt: string;
  userEmail: string | null;
  userName: string | null;
  latestConsent: {
    timestamp: string;
    ipAddress: string;
    documentVersion: string;
  } | null;
};

type StatusFilter = "all" | "pending" | "done" | "archived" | "banned";

const PORTAL_NAMES: Record<string, string> = {
  aws: "AWS",
  "google-vertex": "Google Vertex",
  azure: "Azure",
  replit: "Replit",
  custom: "Custom",
};

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "done", label: "Done" },
  { id: "archived", label: "Archived" },
  { id: "banned", label: "Banned" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  done: "bg-green-500/10 text-green-400 border-green-500/20",
  archived: "bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)] border-[var(--color-glass-border)]",
  banned: "bg-red-500/10 text-red-400 border-red-500/20",
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
      title="Copy"
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCredentials = useCallback(async (p: number, filter: StatusFilter) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/admin/credentials?${params}`);
      if (!res.ok) throw new Error("Failed to load credentials");
      const data = await res.json();
      setCredentials(data.credentials);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials(page, statusFilter);
  }, [page, statusFilter, fetchCredentials]);

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setPage(1);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/credentials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      // Update in-place or remove from list if filter no longer matches
      setCredentials((prev) =>
        statusFilter === "all"
          ? prev.map((c) => (c.id === id ? { ...c, status } : c))
          : prev.filter((c) => c.id !== id)
      );
      if (statusFilter !== "all") setTotal((t) => t - 1);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      {/* Filters + refresh */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex gap-1 bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`px-3 py-1 rounded text-sm transition-all ${
                statusFilter === f.id
                  ? "bg-[rgba(139,92,246,0.2)] text-white border border-purple-500/40"
                  : "text-[var(--color-text-muted)] hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            {total} total
          </p>
          <button
            onClick={() => fetchCredentials(page, statusFilter)}
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--color-text-muted)]">Loading...</div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : credentials.length === 0 ? (
        <div className="step-card text-center py-16">
          <p className="text-[var(--color-text-muted)] text-lg">No credentials found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className={`step-card hover:transform-none ${cred.status === "archived" || cred.status === "banned" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-[rgba(139,92,246,0.2)] text-purple-300 border border-purple-500/30">
                        {cred.portal === "custom" && cred.portalLabel
                          ? cred.portalLabel
                          : PORTAL_NAMES[cred.portal] ?? cred.portal}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${STATUS_STYLES[cred.status] ?? ""}`}>
                        {cred.status}
                      </span>
                      {cred.isDuplicate && (
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          title="Same portal + login already exists from another account"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          duplicate
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium">{cred.userEmail ?? "—"}</p>
                    {cred.userName && (
                      <p className="text-[var(--color-text-muted)] text-sm">{cred.userName}</p>
                    )}
                    {cred.totalPortals > 1 && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {cred.totalPortals} portals submitted
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right text-xs text-[var(--color-text-muted)]">
                      <p>Submitted: {new Date(cred.createdAt).toLocaleString()}</p>
                      {cred.latestConsent && (
                        <>
                          <p>IP: {cred.latestConsent.ipAddress}</p>
                          <p>ToS: {cred.latestConsent.documentVersion}</p>
                        </>
                      )}
                    </div>
                    {/* Action buttons */}
                    {cred.status !== "archived" && cred.status !== "banned" && (
                      <div className="flex gap-2">
                        {cred.status !== "done" && (
                          <button
                            onClick={() => updateStatus(cred.id, "done")}
                            disabled={updating === cred.id}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            title="Mark as done"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Done
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(cred.id, "banned")}
                          disabled={updating === cred.id}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          title="Ban"
                        >
                          <Ban className="w-3 h-3" />
                          Ban
                        </button>
                        <button
                          onClick={() => updateStatus(cred.id, "archived")}
                          disabled={updating === cred.id}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] border border-[var(--color-glass-border)] hover:text-white transition-colors disabled:opacity-50"
                          title="Archive"
                        >
                          <Archive className="w-3 h-3" />
                          Archive
                        </button>
                      </div>
                    )}
                    {(cred.status === "archived" || cred.status === "banned") && (
                      <button
                        onClick={() => updateStatus(cred.id, "pending")}
                        disabled={updating === cred.id}
                        className="text-xs px-2 py-1 rounded text-[var(--color-text-muted)] border border-[var(--color-glass-border)] hover:text-white transition-colors disabled:opacity-50"
                      >
                        Restore
                      </button>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-glass-border)] text-[var(--color-text-muted)] hover:text-white disabled:opacity-30 transition-colors"
              >
                ← Prev
              </button>
              {(() => {
                const delta = 3;
                const pages: (number | "…")[] = [];
                const left = Math.max(1, page - delta);
                const right = Math.min(totalPages, page + delta);
                if (left > 1) { pages.push(1); if (left > 2) pages.push("…"); }
                for (let i = left; i <= right; i++) pages.push(i);
                if (right < totalPages) { if (right < totalPages - 1) pages.push("…"); pages.push(totalPages); }
                return pages.map((p, i) =>
                  p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-sm text-[var(--color-text-muted)]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`min-w-[2rem] px-2 py-1.5 text-sm rounded-lg border transition-colors ${
                        page === p
                          ? "bg-[rgba(139,92,246,0.2)] text-white border-purple-500/40"
                          : "border-[var(--color-glass-border)] text-[var(--color-text-muted)] hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-glass-border)] text-[var(--color-text-muted)] hover:text-white disabled:opacity-30 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

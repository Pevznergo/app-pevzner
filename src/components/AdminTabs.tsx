"use client";

import { useState, useEffect } from "react";
import AdminCredentialList from "@/components/AdminCredentialList";
import AdminTemplateManager from "@/components/AdminTemplateManager";
import AdminChannelManager from "@/components/AdminChannelManager";

type Tab = "credentials" | "templates" | "channels";

const TABS: { id: Tab; label: string }[] = [
  { id: "credentials", label: "Credentials" },
  { id: "templates", label: "Templates" },
  { id: "channels", label: "Channels" },
];

type Stats = {
  credentials: { total: number; pending: number; done: number };
  channels: { total: number; active: number };
};

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-xl px-5 py-3 flex flex-col gap-0.5">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="text-2xl font-semibold text-white">{value}</span>
      {sub && <span className="text-xs text-[var(--color-text-muted)]">{sub}</span>}
    </div>
  );
}

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("credentials");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Credentials"
            value={stats.credentials.total}
            sub={`${stats.credentials.pending} pending · ${stats.credentials.done} done`}
          />
          <StatCard
            label="Channels"
            value={stats.channels.total}
            sub={`${stats.channels.active} active`}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[rgba(139,92,246,0.2)] text-white border border-purple-500/40"
                : "text-[var(--color-text-muted)] hover:text-white"
            }`}
          >
            {tab.label}
            {tab.id === "credentials" && (stats?.credentials.pending ?? 0) > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                {stats!.credentials.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "credentials" && <AdminCredentialList />}
      {activeTab === "templates" && <AdminTemplateManager />}
      {activeTab === "channels" && <AdminChannelManager />}
    </div>
  );
}

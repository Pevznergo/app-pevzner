"use client";

import { useState } from "react";
import AdminCredentialList from "@/components/AdminCredentialList";
import AdminTemplateManager from "@/components/AdminTemplateManager";
import AdminChannelManager from "@/components/AdminChannelManager";

type Tab = "credentials" | "templates" | "channels";

const TABS: { id: Tab; label: string }[] = [
  { id: "credentials", label: "Credentials" },
  { id: "templates", label: "Templates" },
  { id: "channels", label: "Channels" },
];

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("credentials");

  return (
    <div>
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
          </button>
        ))}
      </div>

      {activeTab === "credentials" && <AdminCredentialList />}
      {activeTab === "templates" && <AdminTemplateManager />}
      {activeTab === "channels" && <AdminChannelManager />}
    </div>
  );
}

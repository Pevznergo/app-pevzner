"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, Archive, ArchiveRestore, Settings, Zap, Trash2, FlaskConical } from "lucide-react";

type Template = { id: string; name: string };

type Channel = {
  id: string;
  newapiId: number | null;
  name: string;
  templateId: string | null;
  template: { name: string } | null;
  baseUrl: string;
  apiKey: string;
  proxy: string | null;
  channelType: number;
  status: string;
  createdAt: string;
  newapiStatus: number | null;  // 1=active, 0=disabled, null=unknown
  usedQuota: number | null;
};

const CHANNEL_TYPES: { value: number; label: string }[] = [
  { value: 20, label: "OpenRouter" },
  { value: 1, label: "OpenAI" },
  { value: 3, label: "Azure OpenAI" },
  { value: 14, label: "Anthropic" },
  { value: 24, label: "Google Gemini" },
  { value: 0, label: "Custom" },
];

function getTypeName(type: number) {
  return CHANNEL_TYPES.find((t) => t.value === type)?.label ?? `Type ${type}`;
}

function MaskedText({ text, label }: { text: string; label?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      {label && <span className="text-[var(--color-text-muted)] mr-1">{label}:</span>}
      <span>{visible ? text : "••••••••"}</span>
      <button
        onClick={() => setVisible(!visible)}
        className="text-[var(--color-text-muted)] hover:text-white transition-colors ml-1"
      >
        {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  );
}

export default function AdminChannelManager() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [proxy6Key, setProxy6Key] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [defaultCountry, setDefaultCountry] = useState("in");
  const [defaultPeriod, setDefaultPeriod] = useState(1);
  const [defaultVersion, setDefaultVersion] = useState(3);
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [defaultsSaved, setDefaultsSaved] = useState(false);

  // Create form
  const [formName, setFormName] = useState("");
  const [formTemplateId, setFormTemplateId] = useState("");
  const [formChannelType, setFormChannelType] = useState(20);
  const [formApiKey, setFormApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formProxy, setFormProxy] = useState("");
  const [replitSlug, setReplitSlug] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genCountry, setGenCountry] = useState("in");
  const [genPeriod, setGenPeriod] = useState(1);
  const [genVersion, setGenVersion] = useState(3);
  const [genProxyType, setGenProxyType] = useState("socks5");
  const [showGenOptions, setShowGenOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Per-channel test state
  const [testingId, setTestingId] = useState<string | null>(null);
  type TestResult = { ok: boolean; ms: number; error?: string };
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [chRes, tRes] = await Promise.all([
        fetch("/api/admin/channels"),
        fetch("/api/admin/templates"),
      ]);
      if (chRes.ok) setChannels((await chRes.json()).channels);
      if (tRes.ok) setTemplates((await tRes.json()).templates);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    const [keyRes, countryRes, periodRes, versionRes] = await Promise.all([
      fetch("/api/admin/settings/proxy6_key"),
      fetch("/api/admin/settings/proxy_default_country"),
      fetch("/api/admin/settings/proxy_default_period"),
      fetch("/api/admin/settings/proxy_default_version"),
    ]);
    if (keyRes.ok) {
      const d = await keyRes.json();
      if (d.value) setProxy6Key(d.value);
    }
    if (countryRes.ok) {
      const d = await countryRes.json();
      if (d.value) { setDefaultCountry(d.value); setGenCountry(d.value); }
    }
    if (periodRes.ok) {
      const d = await periodRes.json();
      if (d.value) { const n = Math.max(1, Number(d.value)); setDefaultPeriod(n); setGenPeriod(n); }
    }
    if (versionRes.ok) {
      const d = await versionRes.json();
      if (d.value) { const n = Number(d.value); setDefaultVersion(n); setGenVersion(n); }
    }
  };

  useEffect(() => {
    fetchAll();
    fetchSettings();
  }, []);

  const saveProxy6Key = async () => {
    setSavingKey(true);
    try {
      await fetch("/api/admin/settings/proxy6_key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: proxy6Key }),
      });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
    } finally {
      setSavingKey(false);
    }
  };

  const saveProxyDefaults = async () => {
    setSavingDefaults(true);
    try {
      await Promise.all([
        fetch("/api/admin/settings/proxy_default_country", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: defaultCountry }),
        }),
        fetch("/api/admin/settings/proxy_default_period", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: String(defaultPeriod) }),
        }),
        fetch("/api/admin/settings/proxy_default_version", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: String(defaultVersion) }),
        }),
      ]);
      setGenCountry(defaultCountry);
      setGenPeriod(defaultPeriod);
      setGenVersion(defaultVersion);
      setDefaultsSaved(true);
      setTimeout(() => setDefaultsSaved(false), 2000);
    } finally {
      setSavingDefaults(false);
    }
  };

  const generateProxy = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/proxy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: genCountry, period: genPeriod, version: genVersion, type: genProxyType }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Failed to generate proxy");
        return;
      }
      setFormProxy(data.proxy);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          templateId: formTemplateId || undefined,
          channelType: formChannelType,
          apiKey: formApiKey.trim(),
          baseUrl: formBaseUrl.trim(),
          proxy: formProxy.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to create channel");
        return;
      }
      setFormName("");
      setFormTemplateId("");
      setFormChannelType(20);
      setFormApiKey("");
      setFormBaseUrl("");
      setFormProxy("");
      setChannels((prev) => [data.channel, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArchive = async (channel: Channel) => {
    const newStatus = channel.status === "active" ? "archived" : "active";
    const res = await fetch(`/api/admin/channels/${channel.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const data = await res.json();
      setChannels((prev) => prev.map((c) => (c.id === channel.id ? data.channel : c)));
    }
  };

  const testChannel = async (channel: Channel) => {
    setTestingId(channel.id);
    try {
      const res = await fetch(`/api/admin/channels/${channel.id}/test`, { method: "POST" });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [channel.id]: data }));
    } catch {
      setTestResults((prev) => ({ ...prev, [channel.id]: { ok: false, ms: 0, error: "Network error" } }));
    } finally {
      setTestingId(null);
    }
  };

  const deleteChannel = async (channel: Channel) => {    if (!confirm(`Delete channel "${channel.name}"?\n\nThis will remove it from newapi and the local database. This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/channels/${channel.id}`, { method: "DELETE" });
    if (res.ok) {
      setChannels((prev) => prev.filter((c) => c.id !== channel.id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete channel");
    }
  };

  const visibleChannels = showArchived
    ? channels
    : channels.filter((c) => c.status === "active");

  return (
    <div className="space-y-6">
      {/* Settings panel */}
      <div className="step-card hover:transform-none">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-white transition-colors w-full text-left"
        >
          <Settings className="w-4 h-4" />
          Proxy6.net Settings
          <span className="ml-auto opacity-50">{settingsOpen ? "▲" : "▼"}</span>
        </button>
        {settingsOpen && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                Proxy6.net API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={proxy6Key}
                  onChange={(e) => setProxy6Key(e.target.value)}
                  placeholder="your-proxy6-api-key"
                  className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500/60"
                />
                <button
                  onClick={saveProxy6Key}
                  disabled={savingKey}
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {keySaved ? "Saved!" : savingKey ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--color-glass-border)]">
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Proxy generation defaults</p>
              <div className="flex gap-3 flex-wrap mb-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">Country</label>
                  <input
                    type="text"
                    value={defaultCountry}
                    onChange={(e) => setDefaultCountry(e.target.value)}
                    maxLength={2}
                    placeholder="in"
                    className="w-14 bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-purple-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">Period (days)</label>
                  <input
                    type="number"
                    value={defaultPeriod}
                    onChange={(e) => setDefaultPeriod(Math.max(1, Number(e.target.value)))}
                    min={1}
                    max={365}
                    className="w-16 bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">IP type</label>
                  <select
                    value={defaultVersion}
                    onChange={(e) => setDefaultVersion(Number(e.target.value))}
                    className="bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/60"
                  >
                    <option value={3} className="bg-[#1a1a2e]">IPv4 Dedicated</option>
                    <option value={6} className="bg-[#1a1a2e]">IPv4 Shared</option>
                    <option value={4} className="bg-[#1a1a2e]">IPv6</option>
                  </select>
                </div>
              </div>
              <button
                onClick={saveProxyDefaults}
                disabled={savingDefaults}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50 whitespace-nowrap"
              >
                {defaultsSaved ? "Saved!" : savingDefaults ? "Saving..." : "Save Defaults"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create form */}
      <div className="step-card">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          Create Channel
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                Channel name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. openrouter-prod (auto if empty)"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500/60"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                Channel type
              </label>
              <select
                value={formChannelType}
                onChange={(e) => setFormChannelType(Number(e.target.value))}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/60"
              >
                {CHANNEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#1a1a2e]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                Template <span className="opacity-60">(optional)</span>
              </label>
              <select
                value={formTemplateId}
                onChange={(e) => setFormTemplateId(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/60"
              >
                <option value="" className="bg-[#1a1a2e]">No template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#1a1a2e]">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                API key <span className="opacity-60">(upstream provider key)</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                  placeholder="sk-..."
                  required
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 pr-9 text-sm text-white font-mono placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500/60"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
              Base URL
            </label>
            <input
              type="url"
              value={formBaseUrl}
              onChange={(e) => setFormBaseUrl(e.target.value)}
              placeholder="https://openrouter.ai/api/v1"
              required
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500/60"
            />
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">Replit:</span>
              <input
                type="text"
                value={replitSlug}
                onChange={(e) => setReplitSlug(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (replitSlug.trim()) {
                      setFormBaseUrl(`https://${replitSlug.trim()}.replit.app/api`);
                      setReplitSlug("");
                    }
                  }
                }}
                placeholder="unifi909ck"
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white font-mono placeholder-[var(--color-text-muted)] focus:outline-none focus:border-blue-500/60"
              />
              <button
                type="button"
                onClick={() => {
                  if (replitSlug.trim()) {
                    setFormBaseUrl(`https://${replitSlug.trim()}.replit.app/api`);
                    setReplitSlug("");
                  }
                }}
                className="text-xs px-2.5 py-1 bg-[rgba(59,130,246,0.12)] border border-blue-500/25 rounded text-blue-300 hover:bg-[rgba(59,130,246,0.22)] transition-colors whitespace-nowrap"
              >
                Apply
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
              Proxy <span className="opacity-60">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formProxy}
                onChange={(e) => setFormProxy(e.target.value)}
                placeholder="socks5://user:pass@host:port"
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500/60"
              />
              <button
                type="button"
                onClick={generateProxy}
                disabled={generating}
                className="text-sm px-3 py-2 bg-[rgba(139,92,246,0.15)] border border-purple-500/30 rounded-lg text-purple-300 hover:bg-[rgba(139,92,246,0.25)] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {generating ? "Generating..." : "Generate"}
              </button>
              <button
                type="button"
                onClick={() => setShowGenOptions(!showGenOptions)}
                className="text-xs px-2 py-2 text-[var(--color-text-muted)] hover:text-white border border-[var(--color-glass-border)] rounded-lg transition-colors"
                title="Proxy options"
              >
                ⚙
              </button>
            </div>
            {showGenOptions && (
              <div className="mt-2 p-3 bg-[rgba(255,255,255,0.03)] border border-[var(--color-glass-border)] rounded-lg flex gap-4 flex-wrap">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">Country</label>
                  <input
                    type="text"
                    value={genCountry}
                    onChange={(e) => setGenCountry(e.target.value)}
                    maxLength={2}
                    className="w-14 bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">Period (days)</label>
                  <input
                    type="number"
                    value={genPeriod}
                    onChange={(e) => setGenPeriod(Number(e.target.value))}
                    min={1}
                    max={365}
                    className="w-16 bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">Protocol</label>
                  <select
                    value={genProxyType}
                    onChange={(e) => setGenProxyType(e.target.value)}
                    className="bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="socks5" className="bg-[#1a1a2e]">SOCKS5</option>
                    <option value="http" className="bg-[#1a1a2e]">HTTP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">IP version</label>
                  <select
                    value={genVersion}
                    onChange={(e) => setGenVersion(Number(e.target.value))}
                    className="bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value={3} className="bg-[#1a1a2e]">IPv4 Dedicated</option>
                    <option value={6} className="bg-[#1a1a2e]">IPv4 Shared</option>
                    <option value={4} className="bg-[#1a1a2e]">IPv6</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Channel"}
          </button>
        </form>
      </div>

      {/* Channel list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <p className="text-sm text-[var(--color-text-muted)]">
              {visibleChannels.length} channel{visibleChannels.length !== 1 ? "s" : ""}
              {!showArchived && channels.some((c) => c.status === "archived") && (
                <span className="ml-1 opacity-60">
                  ({channels.filter((c) => c.status === "archived").length} archived)
                </span>
              )}
            </p>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              {showArchived ? "Hide archived" : "Show archived"}
            </button>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-[var(--color-text-muted)]">Loading...</div>
        ) : visibleChannels.length === 0 ? (
          <div className="step-card text-center py-10">
            <p className="text-[var(--color-text-muted)]">No channels yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleChannels.map((ch) => (
              <div
                key={ch.id}
                className={`step-card hover:transform-none ${ch.status === "archived" ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* newapi live status dot */}
                      {ch.newapiId != null && (
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            ch.newapiStatus === 1
                              ? "bg-green-400"
                              : ch.newapiStatus === 0
                              ? "bg-red-400"
                              : "bg-gray-500"
                          }`}
                          title={
                            ch.newapiStatus === 1
                              ? "Active in newapi"
                              : ch.newapiStatus === 0
                              ? "Disabled in newapi"
                              : "Status unknown"
                          }
                        />
                      )}
                      <span className={`font-medium text-white ${ch.status === "archived" ? "line-through" : ""}`}>
                        {ch.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-[rgba(139,92,246,0.15)] text-purple-300 border border-purple-500/20">
                        {getTypeName(ch.channelType)}
                      </span>
                      {ch.template && (
                        <span className="px-2 py-0.5 rounded text-xs bg-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]">
                          {ch.template.name}
                        </span>
                      )}
                      {ch.status === "archived" && (
                        <span className="px-2 py-0.5 rounded text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          Archived
                        </span>
                      )}
                      {ch.newapiId && (
                        <span className="text-xs text-[var(--color-text-muted)] font-mono">
                          #{ch.newapiId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono truncate">
                      {ch.baseUrl}
                    </p>
                    {ch.usedQuota != null && ch.usedQuota > 0 && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        Used:{" "}
                        <span className="text-white font-mono">
                          ${(ch.usedQuota / 500000).toFixed(4)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => toggleArchive(ch)}
                      className="text-[var(--color-text-muted)] hover:text-white transition-colors"
                      title={ch.status === "active" ? "Archive" : "Unarchive"}
                    >
                      {ch.status === "active" ? (
                        <Archive className="w-4 h-4" />
                      ) : (
                        <ArchiveRestore className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteChannel(ch)}
                      className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                      title="Delete channel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--color-glass-border)] flex flex-wrap items-center gap-4">
                  <MaskedText text={ch.apiKey} label="key" />
                  {ch.proxy && <MaskedText text={ch.proxy} label="proxy" />}
                  <div className="ml-auto flex items-center gap-2">
                    {testResults[ch.id] && (
                      <span
                        className={`text-xs font-mono ${
                          testResults[ch.id].ok ? "text-green-400" : "text-red-400"
                        }`}
                        title={testResults[ch.id].error}
                      >
                        {testResults[ch.id].ok
                          ? `${testResults[ch.id].ms} ms`
                          : testResults[ch.id].error ?? "error"}
                      </span>
                    )}
                    <button
                      onClick={() => testChannel(ch)}
                      disabled={testingId === ch.id}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[rgba(59,130,246,0.12)] border border-blue-500/25 rounded text-blue-300 hover:bg-[rgba(59,130,246,0.22)] transition-colors disabled:opacity-50"
                      title="Test channel with google/gemini-3.1-flash-lite-preview"
                    >
                      <FlaskConical className="w-3 h-3" />
                      {testingId === ch.id ? "Testing..." : "Test"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

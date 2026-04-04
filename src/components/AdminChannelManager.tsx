"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, Archive, ArchiveRestore, Settings, Zap } from "lucide-react";

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

  // Create form
  const [formName, setFormName] = useState("");
  const [formTemplateId, setFormTemplateId] = useState("");
  const [formChannelType, setFormChannelType] = useState(20);
  const [formApiKey, setFormApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formProxy, setFormProxy] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genCountry, setGenCountry] = useState("ru");
  const [genPeriod, setGenPeriod] = useState(30);
  const [genVersion, setGenVersion] = useState(3);
  const [showGenOptions, setShowGenOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  const fetchProxy6Key = async () => {
    const res = await fetch("/api/admin/settings/proxy6_key");
    if (res.ok) {
      const data = await res.json();
      if (data.value) setProxy6Key(data.value);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchProxy6Key();
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

  const generateProxy = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/proxy/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: genCountry, period: genPeriod, version: genVersion }),
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
                placeholder="e.g. openrouter-prod"
                required
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
                placeholder="http://user:pass@host:port"
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
                  <label className="block text-xs text-[var(--color-text-muted)] mb-1">Type</label>
                  <select
                    value={genVersion}
                    onChange={(e) => setGenVersion(Number(e.target.value))}
                    className="bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value={3} className="bg-[#1a1a2e]">IPv4 Shared (3)</option>
                    <option value={4} className="bg-[#1a1a2e]">IPv4 (4)</option>
                    <option value={6} className="bg-[#1a1a2e]">IPv6 (6)</option>
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
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--color-glass-border)] flex flex-wrap gap-4">
                  <MaskedText text={ch.apiKey} label="key" />
                  {ch.proxy && <MaskedText text={ch.proxy} label="proxy" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

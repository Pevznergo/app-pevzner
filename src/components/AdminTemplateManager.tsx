"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, RefreshCw } from "lucide-react";

type Template = {
  id: string;
  name: string;
  models: string;
  modelMapping: string | null;
  createdAt: string;
  _count: { channels: number };
};

export default function AdminTemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formName, setFormName] = useState("");
  const [formModels, setFormModels] = useState("");
  const [formMapping, setFormMapping] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/templates");
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      setTemplates(data.templates);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"? Channels using it will lose their template reference.`)) return;
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to delete");
        return;
      }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete template");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          models: formModels.trim(),
          modelMapping: formMapping.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Failed to create template");
        return;
      }
      setFormName("");
      setFormModels("");
      setFormMapping("");
      await fetchTemplates();
    } catch {
      setSubmitError("Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="step-card">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          New Template
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
              Template name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. openrouter-standard"
              required
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500/60"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
              Models <span className="opacity-60">(comma-separated)</span>
            </label>
            <textarea
              value={formModels}
              onChange={(e) => setFormModels(e.target.value)}
              placeholder="gpt-4o,gpt-4,claude-3-5-sonnet,gemini-pro"
              required
              rows={2}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500/60 resize-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-muted)] mb-1">
              Model mapping <span className="opacity-60">(optional, JSON)</span>
            </label>
            <textarea
              value={formMapping}
              onChange={(e) => setFormMapping(e.target.value)}
              placeholder={`{"claude-3-5-sonnet": "claude-3-5-sonnet-20241022"}`}
              rows={2}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--color-glass-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-purple-500/60 resize-none font-mono"
            />
          </div>
          {submitError && (
            <p className="text-red-400 text-sm">{submitError}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Template"}
          </button>
        </form>
      </div>

      {/* List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            {templates.length} template{templates.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={fetchTemplates}
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-[var(--color-text-muted)]">Loading...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
            {error}
          </div>
        ) : templates.length === 0 ? (
          <div className="step-card text-center py-10">
            <p className="text-[var(--color-text-muted)]">No templates yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((t) => (
              <div key={t.id} className="step-card hover:transform-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{t.name}</span>
                      {t._count.channels > 0 && (
                        <span className="text-xs text-[var(--color-text-muted)] bg-[rgba(255,255,255,0.06)] px-2 py-0.5 rounded-full">
                          {t._count.channels} channel{t._count.channels !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono truncate">
                      {t.models.split(",").slice(0, 4).join(", ")}
                      {t.models.split(",").length > 4 && ` +${t.models.split(",").length - 4} more`}
                    </p>
                    {t.modelMapping && (
                      <p className="text-xs text-purple-400/70 mt-0.5 font-mono truncate">
                        mapping: {t.modelMapping}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors flex-shrink-0"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

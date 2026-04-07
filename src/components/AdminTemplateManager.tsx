"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, RefreshCw, Pencil, Check, X } from "lucide-react";

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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editModels, setEditModels] = useState("");
  const [editMapping, setEditMapping] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

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

  const startEdit = (t: Template) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditModels(t.models);
    setEditMapping(t.modelMapping ?? "");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const handleSaveEdit = async (id: string) => {
    setEditError("");
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          models: editModels.trim(),
          modelMapping: editMapping.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "Failed to update template");
        return;
      }
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, name: data.template.name, models: data.template.models, modelMapping: data.template.modelMapping }
            : t
        )
      );
      setEditingId(null);
    } catch {
      setEditError("Request failed");
    } finally {
      setEditSaving(false);
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
                {editingId === t.id ? (
                  /* ── Edit mode ── */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[var(--color-text-muted)] mb-1">Template name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-purple-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/80"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                        Models <span className="opacity-60">(comma-separated)</span>
                      </label>
                      <textarea
                        value={editModels}
                        onChange={(e) => setEditModels(e.target.value)}
                        rows={2}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-purple-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/80 resize-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                        Model mapping <span className="opacity-60">(optional, JSON)</span>
                      </label>
                      <textarea
                        value={editMapping}
                        onChange={(e) => setEditMapping(e.target.value)}
                        rows={2}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-purple-500/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/80 resize-none font-mono"
                      />
                    </div>
                    {editError && <p className="text-red-400 text-xs">{editError}</p>}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(t.id)}
                        disabled={editSaving}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        {editSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={editSaving}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded text-[var(--color-text-muted)] border border-[var(--color-glass-border)] hover:text-white transition-colors disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEdit(t)}
                        className="text-[var(--color-text-muted)] hover:text-purple-400 transition-colors"
                        title="Edit template"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";

interface Project { _id: string; name: string; }
interface Props { onAdded: () => void; count: number; }

export default function AddLinkForm({ onAdded, count }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) fetch("/api/projects").then((r) => r.json()).then(setProjects);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          label: label.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          projectId: projectId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Failed to add link");
      else { setUrl(""); setLabel(""); setTags(""); setProjectId(""); setOpen(false); onAdded(); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg)", border: "1px solid var(--border-bright)", borderRadius: 3,
    padding: "8px 10px", color: "var(--text)", fontFamily: "DM Mono", fontSize: 13,
    outline: "none", width: "100%",
  };

  if (count >= 8) return (
    <div style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.05em" }}>MAX 8 LINKS REACHED</div>
  );

  return (
    <div>
      {!open ? (
        <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Link</button>
      ) : (
        <form onSubmit={handleSubmit} className="card animate-in"
          style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, minWidth: 340 }}>
          <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>NEW LINK</div>

          {[
            { label: "URL *", value: url, setter: setUrl, type: "url", placeholder: "https://example.com" },
            { label: "LABEL", value: label, setter: setLabel, type: "text", placeholder: "e.g. Pricing page" },
            { label: "TAGS (comma-separated)", value: tags, setter: setTags, type: "text", placeholder: "pricing, critical" },
          ].map(({ label: l, value, setter, type, placeholder }) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em" }}>{l}</label>
              <input type={type} placeholder={placeholder} value={value}
                onChange={(e) => setter(e.target.value)} style={inputStyle}
                required={l.includes("*")} />
            </div>
          ))}

          {projects.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em" }}>PROJECT</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} style={inputStyle}>
                <option value="">None</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {error && <div style={{ color: "var(--danger)", fontSize: 12 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
            <button type="button" className="btn" onClick={() => { setOpen(false); setError(""); }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AlertSettings {
  emailEnabled: boolean;
  emailTo: string;
  slackEnabled: boolean;
  slackWebhookUrl: string;
  severityThreshold: "minor" | "moderate" | "major";
}

interface Props {
  initial?: {
    _id?: string;
    name?: string;
    description?: string;
    alertSettings?: AlertSettings;
  };
  onSaved?: () => void;
}

const defaultAlerts: AlertSettings = {
  emailEnabled: false,
  emailTo: "",
  slackEnabled: false,
  slackWebhookUrl: "",
  severityThreshold: "moderate",
};

export default function ProjectForm({ initial, onSaved }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [alerts, setAlerts] = useState<AlertSettings>(initial?.alertSettings ?? defaultAlerts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initial?._id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEdit ? `/api/projects/${initial._id}` : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, alertSettings: alerts }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save project");
      } else {
        onSaved ? onSaved() : router.push("/");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--bg)",
    border: "1px solid var(--border-bright)",
    borderRadius: 3,
    padding: "8px 10px",
    color: "var(--text)",
    fontFamily: "DM Mono",
    fontSize: 13,
    outline: "none",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    color: "var(--muted)",
    letterSpacing: "0.08em",
    marginBottom: 4,
    display: "block",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Name */}
      <div>
        <label style={labelStyle}>PROJECT NAME *</label>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Competitor Tracking" style={inputStyle} />
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>DESCRIPTION</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description" style={inputStyle} />
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Alert settings */}
      <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 13, letterSpacing: "-0.01em" }}>
        ALERT SETTINGS
      </div>

      {/* Severity threshold */}
      <div>
        <label style={labelStyle}>NOTIFY ON SEVERITY ≥</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["minor", "moderate", "major"] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn ${alerts.severityThreshold === s ? "btn-primary" : ""}`}
              onClick={() => setAlerts({ ...alerts, severityThreshold: s })}
              style={{ flex: 1 }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Email */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={alerts.emailEnabled}
            onChange={(e) => setAlerts({ ...alerts, emailEnabled: e.target.checked })}
            style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
          />
          <span style={{ fontSize: 12, letterSpacing: "0.04em" }}>Email alerts</span>
        </label>
        {alerts.emailEnabled && (
          <input
            type="email"
            placeholder="you@example.com"
            value={alerts.emailTo}
            onChange={(e) => setAlerts({ ...alerts, emailTo: e.target.value })}
            style={inputStyle}
          />
        )}
      </div>

      {/* Slack */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={alerts.slackEnabled}
            onChange={(e) => setAlerts({ ...alerts, slackEnabled: e.target.checked })}
            style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
          />
          <span style={{ fontSize: 12, letterSpacing: "0.04em" }}>Slack alerts</span>
        </label>
        {alerts.slackEnabled && (
          <input
            type="url"
            placeholder="https://hooks.slack.com/services/..."
            value={alerts.slackWebhookUrl}
            onChange={(e) => setAlerts({ ...alerts, slackWebhookUrl: e.target.value })}
            style={inputStyle}
          />
        )}
      </div>

      {error && <div style={{ color: "var(--danger)", fontSize: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
        </button>
        <button type="button" className="btn" onClick={() => router.push("/")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
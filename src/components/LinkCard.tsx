"use client";
import { useState } from "react";
import Link from "next/link";

interface LinkDoc {
  _id: string;
  url: string;
  label?: string;
  tags?: string[];
  lastCheckedAt: string | null;
  lastHash: string | null;
}

interface CheckResult {
  status: string;
  summary: string;
  severity?: string;
}

interface Props {
  link: LinkDoc;
  onDeleted: () => void;
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function LinkCard({ link, onDeleted }: Props) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch(`/api/checks/${link._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setResult({ status: data.status, summary: data.summary, severity: data.severity });
    } catch {
      setResult({ status: "error", summary: "Network error" });
    } finally {
      setChecking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this link and all its history?")) return;
    setDeleting(true);
    await fetch(`/api/links/${link._id}`, { method: "DELETE" });
    onDeleted();
  };

  const statusColor = result?.status === "modified" || result?.status === "added"
    ? "var(--accent)"
    : result?.status === "error"
    ? "var(--danger)"
    : "var(--muted)";

  return (
    <div
      className="card"
      style={{
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderLeft: checking ? "2px solid var(--accent)" : "2px solid var(--border)",
        transition: "border-color 0.2s ease",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "-0.01em",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {link.label || new URL(link.url).hostname}
          </div>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--muted)",
                fontSize: 11,
                textDecoration: "none",
                letterSpacing: "0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                whiteSpace: "nowrap",
              }}
            >
              {link.url}
            </a>
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button className="btn" onClick={handleCheck} disabled={checking || deleting}>
            {checking ? (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--accent)",
                  animation: "pulse-dot 1s infinite",
                  display: "inline-block",
                }} />
                Checking
              </span>
            ) : "Check Now"}
          </button>
          <Link href={`/link/${link._id}`}>
            <button className="btn">History</button>
          </Link>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting || checking}>
            ✕
          </button>
        </div>
      </div>

      {/* Tags + last checked */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {link.tags?.map((tag) => (
          <span key={tag} style={{
            fontSize: 10,
            padding: "1px 6px",
            background: "var(--bg)",
            border: "1px solid var(--border-bright)",
            borderRadius: 2,
            color: "var(--muted)",
            letterSpacing: "0.06em",
          }}>
            {tag}
          </span>
        ))}
        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>
          Last checked: {timeAgo(link.lastCheckedAt)}
        </span>
      </div>

      {/* Check result */}
      {result && (
        <div
          className="animate-in"
          style={{
            background: "var(--bg)",
            border: `1px solid ${statusColor}`,
            borderRadius: 3,
            padding: "10px 12px",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className={`tag tag-${result.status}`}>{result.status}</span>
            {result.severity && (
              <span className={`tag tag-${result.severity}`}>{result.severity}</span>
            )}
          </div>
          <div style={{ color: "var(--text)", lineHeight: 1.5 }}>{result.summary}</div>
        </div>
      )}
    </div>
  );
}
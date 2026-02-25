"use client";
import { useState } from "react";
import DiffViewer from "./DiffViewer";

interface Check {
  _id: string;
  checkedAt: string;
  summary: string;
  changeType: string;
  diffHtml: string;
  snippets: { text: string; context: string }[];
}

interface Props {
  checks: Check[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistoryList({ checks }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (checks.length === 0) {
    return (
      <div style={{ color: "var(--muted)", fontSize: 12, padding: "12px 0", letterSpacing: "0.05em" }}>
        NO CHECKS YET
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {checks.map((check, i) => (
        <div
          key={check._id}
          className="card animate-in"
          style={{ animationDelay: `${i * 40}ms`, overflow: "hidden" }}
        >
          <button
            onClick={() => setExpanded(expanded === check._id ? null : check._id)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 10, color: "var(--muted)", minWidth: 60 }}>
              {timeAgo(check.checkedAt)}
            </span>
            <span className={`tag tag-${check.changeType}`}>
              {check.changeType}
            </span>
            <span style={{
              fontSize: 12,
              color: "var(--text)",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {check.summary}
            </span>
            <span style={{ color: "var(--muted)", fontSize: 10 }}>
              {expanded === check._id ? "▲" : "▼"}
            </span>
          </button>

          {expanded === check._id && (
            <div className="animate-in">
              {check.snippets?.length > 0 && (
                <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {check.snippets.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 3,
                        padding: "8px 12px",
                      }}
                    >
                      <div style={{ color: "var(--accent)", fontSize: 12, marginBottom: 2 }}>
                        "{s.text}"
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 10 }}>{s.context}</div>
                    </div>
                  ))}
                </div>
              )}
              <DiffViewer diffHtml={check.diffHtml} changeType={check.changeType} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
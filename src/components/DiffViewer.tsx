"use client";

interface Props {
  diffHtml: string;
  changeType: string;
}

export default function DiffViewer({ diffHtml, changeType }: Props) {
  if (!diffHtml || changeType === "no-change") {
    return (
      <div style={{
        padding: "20px",
        color: "var(--muted)",
        fontSize: 12,
        letterSpacing: "0.05em",
        borderTop: "1px solid var(--border)",
      }}>
        NO CHANGES DETECTED
      </div>
    );
  }

  return (
    <div style={{ borderTop: "1px solid var(--border)" }}>
      <div style={{
        padding: "8px 16px",
        fontSize: 10,
        color: "var(--muted)",
        letterSpacing: "0.08em",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        gap: 16,
      }}>
        <span style={{ color: "var(--added)" }}>■ ADDED</span>
        <span style={{ color: "var(--removed)" }}>■ REMOVED</span>
        <span>■ UNCHANGED</span>
      </div>
      <div
        style={{
          padding: "16px",
          fontFamily: "DM Mono",
          fontSize: 12,
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: 400,
          overflowY: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: diffHtml }}
      />
    </div>
  );
}
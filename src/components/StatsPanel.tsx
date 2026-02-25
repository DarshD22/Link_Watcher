"use client";
import { useEffect, useState } from "react";

interface StatsData {
  totalLinks: number;
  changesLast7Days: number;
  majorChanges: number;
  moderateChanges: number;
  minorChanges: number;
  topChangingLink: { label: string; url: string; changeCount: number } | null;
  dailyCounts: { date: string; count: number }[];
}

function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: number | string;
  accent?: string;
  sub?: string;
}) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 4,
      padding: "16px 20px",
      flex: 1,
      minWidth: 120,
    }}>
      <div style={{
        fontFamily: "Syne, sans-serif",
        fontWeight: 800,
        fontSize: 28,
        letterSpacing: "-0.04em",
        color: accent ?? "var(--text)",
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 4,
      padding: "16px 20px",
      flex: 2,
      minWidth: 200,
    }}>
      <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", marginBottom: 14 }}>
        CHANGES — LAST 7 DAYS
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 40 }}>
        {data.map((d) => (
          <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              title={`${d.count} changes`}
              style={{
                width: "100%",
                height: d.count === 0 ? 2 : `${Math.max((d.count / max) * 36, 4)}px`,
                background: d.count === 0 ? "var(--border)" : "var(--accent)",
                borderRadius: 2,
                transition: "height 0.3s ease",
                opacity: d.count === 0 ? 0.3 : 1,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {data.map((d) => (
          <div key={d.date} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "var(--muted)" }}>
            {d.date}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 80,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            opacity: 0.5,
          }} />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Row 1 — counters + sparkline */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <StatCard
          label="Links monitored"
          value={`${stats.totalLinks}/8`}
          accent="var(--text)"
        />
        <StatCard
          label="Changes (7d)"
          value={stats.changesLast7Days}
          accent="var(--accent)"
        />
        <StatCard
          label="Major changes"
          value={stats.majorChanges}
          accent={stats.majorChanges > 0 ? "var(--danger)" : "var(--muted)"}
        />
        <StatCard
          label="Moderate"
          value={stats.moderateChanges}
          accent={stats.moderateChanges > 0 ? "var(--warning)" : "var(--muted)"}
        />
        <Sparkline data={stats.dailyCounts} />
      </div>

      {/* Row 2 — top changing link */}
      {stats.topChangingLink && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            fontSize: 10, color: "var(--muted)",
            letterSpacing: "0.08em", minWidth: 120,
          }}>
            MOST ACTIVE LINK
          </div>
          <div style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700, fontSize: 13,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {stats.topChangingLink.label}
          </div>
          <a
            href={stats.topChangingLink.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "var(--muted)", textDecoration: "none", marginLeft: "auto", flexShrink: 0 }}
          >
            {stats.topChangingLink.url.slice(0, 40)}…
          </a>
          <span style={{
            fontSize: 10, color: "var(--accent)",
            border: "1px solid var(--accent)",
            borderRadius: 2, padding: "2px 8px",
            letterSpacing: "0.06em", flexShrink: 0,
          }}>
            {stats.topChangingLink.changeCount} changes
          </span>
        </div>
      )}
    </div>
  );
}

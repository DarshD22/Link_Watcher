// src/components/StatusContent.tsx
// Client component that handles the status page logic

"use client";
import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";

interface ServiceStatus {
  ok: boolean;
  latencyMs?: number;
  error?: string;
  note?: string;
  provider?: string;
}

interface StatusData {
  status: "ok" | "degraded";
  checkedAt: string;
  services: {
    server: ServiceStatus;
    database: ServiceStatus;
    llm: ServiceStatus;
  };
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

function StatusDot({ ok, pulse }: { ok: boolean; pulse?: boolean }) {
  return (
    <span style={{
      display: "inline-block",
      width: 10, height: 10,
      borderRadius: "50%",
      background: ok ? "#c8ff00" : "#ff4444",
      boxShadow: ok ? "0 0 8px #c8ff0066" : "0 0 8px #ff444466",
      animation: pulse ? "pulse-dot 2s infinite" : "none",
      flexShrink: 0,
    }} />
  );
}

function ServiceRow({
  name,
  data,
  loading,
}: {
  name: string;
  data: ServiceStatus | undefined;
  loading: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "18px 24px",
      borderBottom: "1px solid #1a1a1a",
    }}>
      {loading || !data ? (
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#333", display: "inline-block" }} />
      ) : (
        <StatusDot ok={data.ok} pulse={data.ok} />
      )}

      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>
          {name}
        </div>
        {data?.note && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{data.note}</div>}
        {data?.provider && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{data.provider}</div>}
        {data?.error && (
          <div style={{
            fontSize: 11, color: "#ff4444", marginTop: 4,
            background: "#ff44440d", padding: "4px 8px", borderRadius: 2,
            fontFamily: "DM Mono, monospace",
          }}>
            {data.error}
          </div>
        )}
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {!loading && data && (
          <>
            <div style={{
              fontSize: 11,
              color: data.ok ? "#c8ff00" : "#ff4444",
              letterSpacing: "0.06em",
              fontWeight: 600,
              textTransform: "uppercase",
            }}>
              {data.ok ? "operational" : "down"}
            </div>
            {data.latencyMs !== undefined && (
              <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
                {data.latencyMs}ms
              </div>
            )}
          </>
        )}
        {loading && (
          <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.06em" }}>checking...</div>
        )}
      </div>
    </div>
  );
}

export default function StatusContent() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [tick, setTick] = useState(0);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/status");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date().toISOString());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Update "X ago" label every second
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const allOk = data?.status === "ok";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        background: "#0a0a0a", minHeight: "100vh",
        color: "#e8e8e8", fontFamily: "DM Mono, monospace",
        display: "flex", gap: 32,
      }}>
        <Suspense fallback={<div style={{ width: 200, padding: "20px", color: "#666" }}>Loading...</div>}>
          <Sidebar allTags={[]} />
        </Suspense>
        
        <div style={{ flex: 1, padding: "60px 24px" }}>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <a href="/dashboard" style={{ color: "#444", fontSize: 11, textDecoration: "none", letterSpacing: "0.06em" }}>
              ← DASHBOARD
            </a>
            <h1 style={{
              fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32,
              letterSpacing: "-0.03em", marginTop: 20, marginBottom: 8,
            }}>
              System Status
            </h1>
            <p style={{ color: "#555", fontSize: 12 }}>
              Refreshes every 30 seconds.{" "}
              {lastUpdated && `Last checked ${timeAgo(lastUpdated)}.`}
            </p>
          </div>

          {/* Overall badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 24px",
            background: allOk ? "rgba(200,255,0,0.04)" : "rgba(255,68,68,0.04)",
            border: `1px solid ${allOk ? "#c8ff0033" : "#ff444433"}`,
            borderRadius: 4,
            marginBottom: 4,
          }}>
            {!loading && data && <StatusDot ok={allOk} pulse />}
            {loading && (
              <span style={{
                display: "inline-block", width: 10, height: 10,
                border: "2px solid #333", borderTopColor: "#c8ff00",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
            )}
            <div>
              <div style={{
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15,
                color: loading ? "#444" : allOk ? "#c8ff00" : "#ff4444",
              }}>
                {loading ? "Checking systems..." : allOk ? "All systems operational" : "Degraded — one or more services down"}
              </div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                {data?.checkedAt ? new Date(data.checkedAt).toLocaleString() : "—"}
              </div>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              style={{
                marginLeft: "auto", background: "none", border: "1px solid #222",
                borderRadius: 3, padding: "5px 12px", color: "#555",
                fontFamily: "DM Mono, monospace", fontSize: 11, cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              {loading ? "..." : "Refresh"}
            </button>
          </div>

          {/* Service rows */}
          <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
            <ServiceRow name="Server" data={data?.services.server} loading={loading} />
            <ServiceRow name="Database (MongoDB)" data={data?.services.database} loading={loading} />
            <ServiceRow name="LLM (Gemini)" data={data?.services.llm} loading={loading} />
          </div>

          {/* Env check hints */}
          <div style={{ marginTop: 32, padding: "16px 20px", background: "#111", border: "1px solid #1a1a1a", borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", marginBottom: 12 }}>
              REQUIRED ENV VARIABLES
            </div>
            {[
              ["MONGODB_URI", "MongoDB Atlas connection string"],
              ["GEMINI_API_KEY", "Google AI Studio free API key"],
              ["RESEND_API_KEY", "Resend email (optional, for alerts)"],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 12 }}>
                <code style={{ color: "#c8ff00", minWidth: 180 }}>{key}</code>
                <span style={{ color: "#444" }}>{desc}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DiffViewer from "@/components/DiffViewer";
import HistoryList from "@/components/HistoryList";

interface Check {
  _id: string;
  checkedAt: string;
  summary: string;
  changeType: string;
  diffHtml: string;
  snippets: { text: string; context: string }[];
}

interface LinkDoc {
  _id: string;
  url: string;
  label?: string;
  tags?: string[];
  lastCheckedAt: string | null;
}

export default function LinkDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [link, setLink] = useState<LinkDoc | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchData = async () => {
    const [linksRes, checksRes] = await Promise.all([
      fetch("/api/links"),
      fetch(`/api/checks/${id}`),
    ]);
    const linksData = await linksRes.json();
    const checksData = await checksRes.json();
    const found = linksData.find((l: LinkDoc) => l._id === id);
    setLink(found ?? null);
    setChecks(Array.isArray(checksData) ? checksData : []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCheck = async () => {
    setChecking(true);
    await fetch(`/api/checks/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setChecking(false);
    fetchData();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(checks, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkwatcher-${id}.json`;
    a.click();
  };

  if (loading) {
    return <div style={{ color: "var(--muted)", fontSize: 12 }}>LOADING...</div>;
  }

  if (!link) {
    return <div style={{ color: "var(--danger)" }}>Link not found.</div>;
  }

  const latest = checks[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Back + header */}
      <div>
        <button
          className="btn"
          onClick={() => router.push("/")}
          style={{ marginBottom: 16 }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>
          {link.label || new URL(link.url).hostname}
        </h1>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none" }}
        >
          {link.url}
        </a>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" onClick={handleCheck} disabled={checking}>
          {checking ? "Checking..." : "Check Now"}
        </button>
        {checks.length > 0 && (
          <button className="btn" onClick={handleExport}>Export JSON</button>
        )}
      </div>

      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Latest check summary */}
      {latest && (
        <div>
          <div style={{
            fontSize: 10,
            color: "var(--muted)",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}>
            LATEST CHECK — {new Date(latest.checkedAt).toLocaleString()}
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`tag tag-${latest.changeType}`}>{latest.changeType}</span>
              <span style={{ fontSize: 13, color: "var(--text)" }}>{latest.summary}</span>
            </div>

            {latest.snippets?.length > 0 && (
              <div style={{
                padding: "0 16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}>
                {latest.snippets.map((s, i) => (
                  <div key={i} style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 3,
                    padding: "8px 12px",
                  }}>
                    <div style={{ color: "var(--accent)", fontSize: 12, marginBottom: 2 }}>
                      "{s.text}"
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 10 }}>{s.context}</div>
                  </div>
                ))}
              </div>
            )}

            <DiffViewer diffHtml={latest.diffHtml} changeType={latest.changeType} />
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <div style={{
          fontSize: 10,
          color: "var(--muted)",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}>
          HISTORY — LAST {checks.length} CHECKS
        </div>
        <HistoryList checks={checks} />
      </div>
    </div>
  );
}
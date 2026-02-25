"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AddLinkForm from "@/components/AddLinkForm";
import LinkCard from "@/components/LinkCard";
import Sidebar from "@/components/Sidebar";
import StatsPanel from "@/components/StatsPanel";

interface LinkDoc {
  _id: string;
  url: string;
  label?: string;
  tags?: string[];
  lastCheckedAt: string | null;
  lastHash: string | null;
}

export default function Dashboard() {
  const [links, setLinks] = useState<LinkDoc[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAll, setCheckingAll] = useState(false);
  const searchParams = useSearchParams();

  const fetchLinks = useCallback(async () => {
    const params = new URLSearchParams();
    const projectId = searchParams.get("projectId");
    const tag = searchParams.get("tag");
    if (projectId) params.set("projectId", projectId);
    if (tag) params.set("tag", tag);

    const res = await fetch(`/api/links?${params.toString()}`);
    const data: LinkDoc[] = await res.json();
    setLinks(data);

    // Collect all unique tags for sidebar
    const tags = [...new Set(data.flatMap((l) => l.tags ?? []))];
    setAllTags(tags);
    setLoading(false);
  }, [searchParams]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleCheckAll = async () => {
    setCheckingAll(true);
    await Promise.all(
      links.map((l) =>
        fetch(`/api/checks/${l._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      )
    );
    setCheckingAll(false);
    fetchLinks();
  };

  const activeFilter = searchParams.get("projectId")
    ? "project"
    : searchParams.get("tag")
    ? "tag"
    : null;

  return (
    <div style={{ display: "flex", gap: 32 }}>
      <Sidebar allTags={allTags} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em" }}>
              {activeFilter === "project" ? "Project Links"
                : activeFilter === "tag" ? `#${searchParams.get("tag")}`
                : "All Links"}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
              {links.length}/8 links monitored
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {links.length > 1 && (
              <button className="btn" onClick={handleCheckAll} disabled={checkingAll}>
                {checkingAll ? "Checking all..." : "Check All"}
              </button>
            )}
            <AddLinkForm onAdded={fetchLinks} count={links.length} />
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />
        
        <StatsPanel /> 

        {loading ? (
          <div style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.06em" }}>LOADING...</div>
        ) : links.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
            <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              No links here
            </div>
            <div style={{ fontSize: 12 }}>
              {activeFilter ? "No links match this filter." : "Add your first link to start monitoring."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {links.map((link) => (
              <LinkCard key={link._id} link={link} onDeleted={fetchLinks} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

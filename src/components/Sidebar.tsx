"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface Project {
  _id: string;
  name: string;
}

interface Props {
  allTags: string[];
}

export default function Sidebar({ allTags }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProject = searchParams.get("projectId");
  const activeTag = searchParams.get("tag");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error("Expected array from /api/projects, got:", data);
          setProjects([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setProjects([]);
      });
  }, []);

  const linkStyle = (active: boolean) => ({
    display: "block",
    padding: "6px 12px",
    borderRadius: 3,
    fontSize: 12,
    color: active ? "var(--accent)" : "var(--muted)",
    background: active ? "rgba(200,255,0,0.06)" : "transparent",
    textDecoration: "none",
    letterSpacing: "0.04em",
    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
    transition: "all 0.15s ease",
  });

  return (
    <aside style={{
      width: 200,
      flexShrink: 0,
      borderRight: "1px solid var(--border)",
      paddingRight: 20,
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }}>
      {/* Main Navigation */}
      <div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 8 }}>
          NAVIGATION
        </div>
        <Link href="/dashboard" style={linkStyle(pathname === "/dashboard")}>
          Dashboard
        </Link>
        <Link href="/home" style={linkStyle(pathname === "/home")}>
          Home
        </Link>
        <Link href="/status" style={linkStyle(pathname === "/status")}>
          Status
        </Link>
      </div>

      {/* Views */}
      <div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 8 }}>
          VIEWS
        </div>
        <Link href="/dashboard" style={linkStyle(!activeProject && !activeTag && pathname === "/dashboard")}>
          All Links
        </Link>
      </div>

      {/* Projects */}
      <div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 8 }}>
          PROJECTS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {projects.length === 0 && (
            <span style={{ fontSize: 11, color: "var(--border-bright)", padding: "4px 12px" }}>
              No projects yet
            </span>
          )}
          {projects.map((p) => (
            <Link
              key={p._id}
              href={`/dashboard?projectId=${p._id}`}
              style={linkStyle(activeProject === p._id)}
            >
              {p.name}
            </Link>
          ))}
          <Link href="/projects/new" style={linkStyle(false)}>
            <span style={{ color: "var(--border-bright)" }}>+ New project</span>
          </Link>
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 8 }}>
            TAGS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={`/dashboard?tag=${tag}`}
                style={linkStyle(activeTag === tag)}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Severity filter */}
      <div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 8 }}>
          SEVERITY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {["major", "moderate", "minor"].map((s) => (
            <Link
              key={s}
              href={`/?severity=${s}`}
              style={linkStyle(searchParams.get("severity") === s)}
            >
              <span className={`tag tag-${s}`} style={{ border: "none", padding: 0, fontSize: 11 }}>
                {s}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
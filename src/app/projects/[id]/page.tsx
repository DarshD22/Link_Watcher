"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import LinkCard from "@/components/LinkCard";

interface LinkDoc {
  _id: string;
  url: string;
  label?: string;
  tags?: string[];
  lastCheckedAt: string | null;
  lastHash: string | null;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  alertSettings: any;
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [links, setLinks] = useState<LinkDoc[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [projRes, linksRes] = await Promise.all([
      fetch(`/api/projects/${id}`),
      fetch(`/api/links?projectId=${id}`),
    ]);
    setProject(await projRes.json());
    setLinks(await linksRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this project? Links will be unassigned.")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/");
  };

  if (loading) return <div style={{ color: "var(--muted)", fontSize: 12 }}>LOADING...</div>;
  if (!project) return <div style={{ color: "var(--danger)" }}>Project not found.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <button className="btn" onClick={() => router.push("/")} style={{ marginBottom: 12 }}>
            ← Back
          </button>
          <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em" }}>
            {project.name}
          </h1>
          {project.description && (
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{project.description}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {editing && (
        <div className="card" style={{ padding: 24 }}>
          <ProjectForm
            initial={project}
            onSaved={() => { setEditing(false); fetchData(); }}
          />
        </div>
      )}

      <div style={{ height: 1, background: "var(--border)" }} />

      <div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", marginBottom: 12 }}>
          LINKS IN THIS PROJECT — {links.length}
        </div>
        {links.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            No links assigned to this project yet. Add a link and select this project.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {links.map((link) => (
              <LinkCard key={link._id} link={link} onDeleted={fetchData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
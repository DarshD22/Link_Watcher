import ProjectForm from "@/components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24, letterSpacing: "-0.03em", marginBottom: 24 }}>
        New Project
      </h1>
      <ProjectForm />
    </div>
  );
}
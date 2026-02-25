import { Suspense } from "react";
import StatusContent from "@/components/StatusContent";

export default function StatusPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", color: "var(--muted)" }}>Loading status...</div>}>
      <StatusContent />
    </Suspense>
  );
}

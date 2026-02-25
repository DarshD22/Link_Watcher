import { Suspense } from "react";
import DashboardContent from "@/components/DashboardContent";

export default function Dashboard() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", color: "var(--muted)" }}>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}


"use client";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DashboardContent />
    </div>
  );
}

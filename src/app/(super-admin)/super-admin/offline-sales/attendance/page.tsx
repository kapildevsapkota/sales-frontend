"use client";

import { OfflineSalesNav } from "@/components/offline-sales/offline-sales-nav";
import { OfflineAttendanceView } from "@/components/offline-sales/attendance/offline-attendance-view";

export default function OfflineAttendancePage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6">
      <OfflineSalesNav />
      <OfflineAttendanceView />
    </div>
  );
}


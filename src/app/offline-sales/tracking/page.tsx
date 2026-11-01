"use client";

import { OfflineSalesNav } from "@/components/offline-sales/offline-sales-nav";
import { SalespersonTrackingView } from "@/components/offline-sales/tracking/salesperson-tracking-view";

export default function OfflineTrackingPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6">
      <OfflineSalesNav />
      <SalespersonTrackingView />
    </div>
  );
}


"use client";

import { OfflineSalesNav } from "@/components/offline-sales/offline-sales-nav";
import { OfflineConfigView } from "@/components/offline-sales/config/offline-config-view";

export default function OfflineConfigPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6">
      <OfflineSalesNav />
      <OfflineConfigView />
    </div>
  );
}


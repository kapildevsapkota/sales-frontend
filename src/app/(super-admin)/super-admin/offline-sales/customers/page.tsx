"use client";

import { OfflineSalesNav } from "@/components/offline-sales/offline-sales-nav";
import { OfflineCustomersView } from "@/components/offline-sales/customers/offline-customers-view";

export default function OfflineCustomersPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6">
      <OfflineSalesNav />
      <OfflineCustomersView />
    </div>
  );
}


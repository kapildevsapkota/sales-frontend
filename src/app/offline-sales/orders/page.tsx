"use client";

import { OfflineSalesNav } from "@/components/offline-sales/offline-sales-nav";
import { OfflineOrdersTable } from "@/components/offline-sales/orders/offline-orders-table";

export default function OfflineOrdersPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6">
      <OfflineSalesNav />
      <OfflineOrdersTable />
    </div>
  );
}


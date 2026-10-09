"use client";

import FranchiseOrdersTable from "@/components/franchiseOrdersTable/franchise-orders-table";

export default function AdminOrdersPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 p-4 sm:p-6">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-6">
        <FranchiseOrdersTable
          selectableRows={true}
          showExportPickAndDrop={true}
        />
      </div>
    </main>
  );
}

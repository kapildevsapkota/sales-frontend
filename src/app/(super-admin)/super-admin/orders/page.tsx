"use client";

import { Package, ShoppingBag, ShieldCheck } from "lucide-react";
import FranchiseOrdersTable from "@/components/franchiseOrdersTable/franchise-orders-table";

export default function SuperAdminOrdersPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-neutral-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-xs">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Orders Management
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <ShieldCheck className="h-3 w-3" />
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live backend search and order fulfillment tracking across all franchises and channels
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-6">
        <FranchiseOrdersTable
          selectableRows={true}
          showExportPickAndDrop={true}
          canChangeStatus={true}
        />
      </div>
    </div>
  );
}

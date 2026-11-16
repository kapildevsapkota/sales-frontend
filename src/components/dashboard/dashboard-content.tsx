"use client";

import Link from "next/link";
import { FileSpreadsheet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, Role } from "@/contexts/AuthContext";
import { DashboardStatsPanels } from "@/components/dashboard/DashboardStatsPanels";
import { DashboardSalesOverview } from "@/components/dashboard/DashboardSalesOverview";
import { DashboardTopSalesPersons } from "@/components/dashboard/DashboardTopSalesPersons";
import { InventoryBanner } from "@/components/dashboard/inventory-banner";
import { InventoryRequestBanner } from "@/components/dashboard/inventory-request-banner";
import { DashboardBarchart } from "@/components/dashboard/DashboardBarchart";
import { BulkOrders } from "./bulk-orders";

export const DashboardContent: React.FC<{ id?: string }> = ({ id }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === Role.SuperAdmin;

  return (
    <div className="container mx-auto space-y-6 sm:p-4 md:p-6">
      {/* Top Action Bar / Reports Navigation - Visible only for Super Admin */}
      {isSuperAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Franchise Sales Report
              </h2>
              <p className="text-xs text-slate-500">
                Detailed breakdown of online vs office sales and product performance per franchise
              </p>
            </div>
          </div>
          <Link href="/super-admin/reports/franchise-sales">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto h-8.5 gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-medium border-slate-200"
            >
              <span>View Reports</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </Link>
        </div>
      )}

      <InventoryBanner id={id} />
      <InventoryRequestBanner />

      {/* Modern Stat Panels */}
      <DashboardStatsPanels id={id} />

      {/* Sales Overview and Top Sales Persons */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <DashboardSalesOverview id={id} />
        <DashboardTopSalesPersons id={id} />
      </div>

      <div className="flex flex-col gap-4">
        <DashboardBarchart id={id} />
        <BulkOrders />
      </div>

      {/* Top Products and Revenue by Category */}
      {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <DashboardTopProducts id={id} />
        <DashboardRevenueByCategory id={id} />
      </div> */}
    </div>
  );
};

import { DashboardStatsPanels } from "@/components/dashboard/DashboardStatsPanels";
import { DashboardSalesOverview } from "@/components/dashboard/DashboardSalesOverview";
import { DashboardTopSalesPersons } from "@/components/dashboard/DashboardTopSalesPersons";
import { DashboardTopProducts } from "@/components/dashboard/DashboardTopProducts";
import { DashboardRevenueByCategory } from "@/components/dashboard/DashboardRevenueByCategory";
import { InventoryBanner } from "@/components/dashboard/inventory-banner";
import { InventoryRequestBanner } from "@/components/dashboard/inventory-request-banner";
import { DashboardBarchart } from "@/components/dashboard/DashboardBarchart";
import { BulkOrders } from "./bulk-orders";

export const DashboardContent: React.FC<{ id?: string }> = ({ id }) => {
  return (
    <div className="container mx-auto space-y-6  sm:p-4 md:p-6 ">
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
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <DashboardTopProducts id={id} />
        <DashboardRevenueByCategory id={id} />
      </div>
    </div>
  );
};

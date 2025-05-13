import { DashboardStatsPanels } from "@/components/dashboard/DashboardStatsPanels";
import { DashboardSalesOverview } from "@/components/dashboard/DashboardSalesOverview";
import { DashboardTopSalesPersons } from "@/components/dashboard/DashboardTopSalesPersons";
import { DashboardTopProducts } from "@/components/dashboard/DashboardTopProducts";
import { DashboardRevenueByCategory } from "@/components/dashboard/DashboardRevenueByCategory";
import { InventoryBanner } from "@/components/dashboard/inventory-banner";

export const DashboardContent: React.FC = () => {
  return (
    <div className="container mx-auto space-y-6  sm:p-4 md:p-6 ">
      <InventoryBanner />

      {/* Modern Stat Panels */}
      <DashboardStatsPanels />

      {/* Sales Overview and Top Sales Persons */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <DashboardSalesOverview />
        <DashboardTopSalesPersons />
      </div>

      {/* Top Products and Revenue by Category */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <DashboardTopProducts />
        <DashboardRevenueByCategory />
      </div>
    </div>
  );
};

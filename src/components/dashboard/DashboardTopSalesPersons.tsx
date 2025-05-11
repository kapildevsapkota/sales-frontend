import { RecentSales } from "@/components/dashboard/recent-sales";

export function DashboardTopSalesPersons() {
  return (
    <div className="col-span-full lg:col-span-3 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0">
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900">
          Top Sales Persons
        </div>
        <div className="text-sm text-gray-500">Sales by persons</div>
      </div>
      <RecentSales />
    </div>
  );
}

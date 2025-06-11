import { RevenueChart } from "@/components/dashboard/revenue-chart";

export function DashboardRevenueByCategory({ id }: { id?: string }) {
  return (
    <div className="col-span-full lg:col-span-4 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0">
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900">
          Revenue by Category
        </div>
        <div className="text-sm text-gray-500">
          Revenue distribution across product categories
        </div>
      </div>
      <div className="px-0 sm:px-6 overflow-x-auto w-full min-w-[320px]">
        <RevenueChart id={id} />
      </div>
    </div>
  );
}

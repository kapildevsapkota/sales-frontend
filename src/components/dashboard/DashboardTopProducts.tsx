import { TopProducts } from "@/components/dashboard/top-products";

export function DashboardTopProducts({ id }: { id?: string }) {
  return (
    <div className="col-span-full lg:col-span-3 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0">
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900">Top Products</div>
        <div className="text-sm text-gray-500">
          Your best selling products this month
        </div>
      </div>
      <TopProducts id={id} />
    </div>
  );
}

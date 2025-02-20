import { Suspense } from "react";
import { Loading } from "@/components/ui/Loading";
import SalesPage from "@/app/(admin)/admin/SalesList/page";

export default function OrderListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Orders</h1>
      </div>
      <div className="bg-white p-6">
        <Suspense fallback={<Loading />}>
          <SalesPage />
        </Suspense>
      </div>
    </div>
  );
}

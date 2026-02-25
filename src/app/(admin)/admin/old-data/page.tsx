import SalesTable from "@/components/orderList/orderList";

export default function OldDataPage() {
    return (
        <main className="min-h-screen bg-white">

            <SalesTable endpoint="/api/sales/orders/historical/" />
        </main>
    );
}
import SalesTable from "@/components/orderList/orderList";
import TabBar from "@/components/layout/badgebar";

export default function OldDataPage() {
    return (
        <main className="min-h-screen bg-white">
            <div className="">
                <div className="pt-5 pb-10">
                    <TabBar />
                </div>
                <SalesTable endpoint="/api/sales/orders/historical/" />
            </div>
        </main>
    );
}
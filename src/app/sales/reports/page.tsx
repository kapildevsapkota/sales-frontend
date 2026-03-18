import SalesReport from "@/components/salesperson/sales-report";
import TabBar from "@/components/layout/badgebar";

export default function SalesReportsPage() {
    return (
        <main className="min-h-screen bg-white">
            <div className="pt-5 pb-10">
                <TabBar />
            </div>
            <SalesReport />
        </main>
    );}

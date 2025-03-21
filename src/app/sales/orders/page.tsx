import SalesTable from "@/components/orderList/orderList";
import TabBar from "@/components/layout/badgebar";

export default function SalesOrdersTable() {
  return (
    <main className="min-h-screen bg-white">
      <div className="">
        <div className="pt-5 pb-10">
          <TabBar />
        </div>
        <SalesTable />
      </div>
    </main>
  );
}

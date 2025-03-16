import SalesTable from "@/components/salesTable/salesTable";

export default function SalesOrdersTable() {
  return (
    <main className="min-h-screen bg-white">
      <div className="">
        <h1 className="text-2xl font-bold mb-6">Sales Orders</h1>
        <SalesTable />
      </div>
    </main>
  );
}

import { StatusCards } from "./components/status-cards";
import { OrderChart } from "./components/order-chart";
import { SidebarStats } from "./components/sidebar-stats";
import { Totals } from "./components/totals";

export default function YdmView({ id }: { id: number }) {
  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">YDM Dashboard</h1>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Content Area - Status Cards and Chart */}
          <div className="xl:col-span-3 space-y-6">
            {/* Status Cards */}
            <div className="w-full">
              <StatusCards id={Number(id)} />
              <Totals id={Number(id)} />
            </div>

            {/* Order Chart */}
            <div className="w-full">
              <OrderChart id={Number(id)} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-20">
              <SidebarStats id={Number(id)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

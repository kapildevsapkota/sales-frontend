import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeframe } from "@/components/dashboard/types";
import { useState } from "react";
import { SalesPersonRevenue } from "./SalesPersonRevenue";

interface SalesPersonSalesOverviewProps {
  phoneNumber: string;
}

export function SalesPersonSalesOverview({
  phoneNumber,
}: SalesPersonSalesOverviewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");

  return (
    <div className="col-span-full lg:col-span-4 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0 overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            Sales Overview
          </div>
          <div className="text-sm text-gray-500">Monthly sales performance</div>
        </div>
        <Tabs
          defaultValue={timeframe}
          onValueChange={(value) => setTimeframe(value as Timeframe)}
          className="w-full sm:w-auto mt-4 sm:mt-0"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="overflow-x-auto w-full min-w-[320px]">
        {/* Pass phoneNumber and timeframe */}
        <SalesPersonRevenue timeframe={timeframe} phoneNumber={phoneNumber} />
      </div>
    </div>
  );
}

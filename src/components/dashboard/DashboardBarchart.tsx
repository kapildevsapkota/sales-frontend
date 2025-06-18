import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeframe } from "@/components/dashboard/types";
import { useState } from "react";
import { DashboardBarChart } from "./bar-chart";
import DateRangePicker from "../ui/date-range-picker";
import { DateRange } from "react-day-picker";

export function DashboardBarchart({ id }: { id?: string }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  return (
    <div className="col-span-full lg:col-span-4 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0 overflow-x-auto">
      <div className="flex items-center flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
        <div className="text-lg font-semibold text-gray-900">
          Sales Performance
        </div>
        <div className="flex gap-3">
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
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
        </div>
      </div>
      <div className="overflow-x-auto w-full ">
        <DashboardBarChart
          timeframe={timeframe}
          id={id}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}

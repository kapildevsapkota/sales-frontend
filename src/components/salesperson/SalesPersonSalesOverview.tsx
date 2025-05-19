import { Timeframe } from "@/components/dashboard/types";
import { SalesPersonRevenue } from "./SalesPersonRevenue";
import { format } from "date-fns";

interface SalesPersonSalesOverviewProps {
  phoneNumber: string;
  timeframe: Timeframe;
  date: Date | undefined;
}

export function SalesPersonSalesOverview({
  phoneNumber,
  timeframe,
  date,
}: SalesPersonSalesOverviewProps) {
  return (
    <div className="col-span-full lg:col-span-4 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0 overflow-x-auto">
      <div className="flex items-center mb-4 gap-2">
        <div className="text-lg font-semibold text-gray-900">
          Sales Overview
        </div>
        <div className="text-sm text-gray-500">
          {timeframe} {date && `(${format(date, "MMM d, yyyy")})`}
        </div>
      </div>
      <div className="overflow-x-auto w-full min-w-[320px]">
        {/* Pass phoneNumber, timeframe and date */}
        <SalesPersonRevenue
          timeframe={timeframe}
          phoneNumber={phoneNumber}
          date={date}
        />
      </div>
    </div>
  );
}

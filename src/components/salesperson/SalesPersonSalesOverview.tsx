import { Timeframe } from "@/components/dashboard/types";
import { SalesPersonRevenue } from "./SalesPersonRevenue";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface SalesPersonSalesOverviewProps {
  phoneNumber: string;
  timeframe: Timeframe;
  dateRange: DateRange | undefined;
}

export function SalesPersonSalesOverview({
  phoneNumber,
  timeframe,
  dateRange,
}: SalesPersonSalesOverviewProps) {
  return (
    <div className="col-span-full lg:col-span-4 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0 overflow-x-auto">
      <div className="flex items-center mb-4 gap-2">
        <div className="text-lg font-semibold text-gray-900">
          Sales Overview
        </div>
        <div className="text-sm text-gray-500">
          {timeframe}{" "}
          {dateRange?.from &&
            (dateRange.to
              ? `(${format(dateRange.from, "MMM d")} - ${format(
                  dateRange.to,
                  "MMM d, yyyy"
                )})`
              : `(${format(dateRange.from, "MMM d, yyyy")})`)}
        </div>
      </div>
      <div className="overflow-x-auto w-full min-w-[320px]">
        <SalesPersonRevenue
          timeframe={timeframe}
          dateRange={dateRange}
          phoneNumber={phoneNumber}
        />
      </div>
    </div>
  );
}

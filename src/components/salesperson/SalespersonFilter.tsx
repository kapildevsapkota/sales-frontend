import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeframe } from "@/components/dashboard/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string): Promise<any> =>
  api.get(url).then((res): any => res.data);

interface Salesperson {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
}

interface SalespersonFilterProps {
  timeframe?: Timeframe;
  setTimeframe?: (value: Timeframe) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  showTimeframe?: boolean;
  salespersonId?: string;
  onSalespersonChange?: (id: string) => void;
  showSalespersonFilter?: boolean;
}

export function SalespersonFilter({
  timeframe,
  setTimeframe,
  dateRange,
  setDateRange,
  showTimeframe = true,
  salespersonId,
  onSalespersonChange,
  showSalespersonFilter = false,
}: SalespersonFilterProps) {
  const { data: usersData } = useSWR<any>("/api/account/users/", fetcher);
  const salespeople: Salesperson[] = (usersData || []).filter(
    (u: any) => u.role === "SalesPerson"
  );

  const isFiltered =
    dateRange !== undefined ||
    (showTimeframe && timeframe !== "daily") ||
    (showSalespersonFilter && salespersonId && salespersonId !== "all");

  const handleSetToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setDateRange({
      from: today,
      to: today,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
      {/* Timeframe Tabs */}
      {showTimeframe && timeframe && setTimeframe && (
        <Tabs
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as Timeframe)}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Date Range Picker */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-fit sm:w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white border" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              initialFocus
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="sm"
          className="h-10 px-3 shrink-0"
          onClick={handleSetToday}
        >
          Today
        </Button>
      </div>



      {/* Conditionally Render Clear Filters Button */}
      {isFiltered && (
        <Button
          variant="ghost"
          className="text-sm text-gray-800 border"
          onClick={() => {
            setDateRange(undefined);
            if (showTimeframe && setTimeframe) {
              setTimeframe("daily"); // reset to default
            }
            if (onSalespersonChange) {
              onSalespersonChange("all");
            }
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}

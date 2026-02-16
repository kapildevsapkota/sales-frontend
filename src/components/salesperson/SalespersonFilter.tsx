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

interface SalespersonFilterProps {
  timeframe?: Timeframe;
  setTimeframe?: (value: Timeframe) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  showTimeframe?: boolean;
}

export function SalespersonFilter({
  timeframe,
  setTimeframe,
  dateRange,
  setDateRange,
  showTimeframe = true,
}: SalespersonFilterProps) {
  const isFiltered = dateRange !== undefined || (showTimeframe && timeframe !== "daily");

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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal",
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
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}

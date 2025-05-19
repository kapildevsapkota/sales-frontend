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

interface SalespersonFilterProps {
  timeframe: Timeframe;
  setTimeframe: (value: Timeframe) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function SalespersonFilter({
  timeframe,
  setTimeframe,
  date,
  setDate,
}: SalespersonFilterProps) {
  const isFiltered = date !== undefined || timeframe !== "daily";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
      {/* Timeframe Tabs */}
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

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Conditionally Render Clear Filters Button */}
      {isFiltered && (
        <Button
          variant="ghost"
          className="text-sm bg-red-500 hover:bg-red-600"
          onClick={() => {
            setDate(undefined);
            setTimeframe("daily"); // reset to default
          }}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}

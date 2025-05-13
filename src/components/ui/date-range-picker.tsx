"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  className?: string;
  value?: DateRange | undefined;
  onChange?: (date: DateRange | undefined) => void;
}

export default function DateRangePicker({
  className,
  value,
  onChange,
}: DateRangePickerProps) {
  // Use the provided value and onChange props, or fall back to internal state
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  // Update internal state when props change
  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value);
    }
  }, [value]);

  // Handle date changes
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  // Clear the date range
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDateChange(undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full md:w-[240px] justify-start text-left font-normal h-10",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, yyyy")} -{" "}
                  {format(date.to, "MMM dd, yyyy")}
                  <X
                    className="ml-2 h-4 w-4 hover:text-destructive"
                    onClick={handleClear}
                    aria-label="Clear date range"
                  />
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

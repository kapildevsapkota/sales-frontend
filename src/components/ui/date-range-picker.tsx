"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  className?: string;
  value?: DateRange | undefined;
  onChange?: (date: DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  emptyLabel?: string;
}

export default function DateRangePicker({
  className,
  value,
  onChange,
  minDate,
  maxDate,
  clearable = false,
  emptyLabel = "Select date range",
}: DateRangePickerProps) {
  // Use the provided value and onChange props, or fall back to internal state
  const [date, setDate] = React.useState<DateRange | undefined>(value);

  // Update internal state when props change (including clearing when value is undefined)
  React.useEffect(() => {
    setDate(value);
  }, [value]);

  // Handle date changes
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  // Clear the date range
  // const handleClear = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   setDate(undefined);
  //   if (onChange) {
  //     onChange(undefined);
  //   }
  // };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDate(undefined);
    onChange?.(undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full md:w-[260px] justify-start text-left font-normal h-10 pr-8 relative",
              !date?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MMM dd, yyyy")} -{" "}
                    {format(date.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(date.from, "MMM dd, yyyy")
                )
              ) : (
                emptyLabel
              )}
            </span>
            {clearable && date?.from && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClear(e as unknown as React.MouseEvent);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Clear date filter"
              >
                <X className="h-4 w-4" />
              </span>
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
            disabled={(day) => {
              const date = startOfDay(day);
              if (minDate && date < startOfDay(minDate)) return true;
              if (maxDate && date > startOfDay(maxDate)) return true;
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

import React from "react";
import DateRangePicker from "@/components/ui/date-range-picker";

const DateFilters = () => {
  const [dateRange, setDateRange] = React.useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const handleDateRangeChange = (
    newDateRange: [Date | undefined, Date | undefined]
  ) => {
    setDateRange(newDateRange);
  };
  return (
    <div className="flex gap-3">
      <DateRangePicker
        value={{ from: dateRange[0], to: dateRange[1] }}
        onChange={(date) => {
          if (date) {
            handleDateRangeChange([date.from, date.to]);
          } else {
            handleDateRangeChange([undefined, undefined]);
          }
        }}
        className="w-full"
      />
    </div>
  );
};

const DateFilter = () => {
  return (
    <div>
      <DateFilters />
    </div>
  );
};

export default DateFilter;

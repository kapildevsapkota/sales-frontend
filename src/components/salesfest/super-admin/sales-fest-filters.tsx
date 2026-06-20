import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DateRangePicker from "@/components/ui/date-range-picker";
import { SalesFilter } from "./types";

interface SalesFestFiltersProps {
  activeTab: "overview" | "franchise" | "rankings";
  filter: SalesFilter;
  dateRange: DateRange | undefined;
  hasActiveFilters: boolean;
  onFilterChange: (filter: SalesFilter) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
}

const FILTER_OPTIONS: SalesFilter[] = ["daily", "weekly", "monthly", "all"];

export function SalesFestFilters({
  activeTab,
  filter,
  dateRange,
  hasActiveFilters,
  onFilterChange,
  onDateRangeChange,
  onClearFilters,
}: SalesFestFiltersProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-4 sm:pt-6">
        {activeTab === "rankings" ? (
          <p className="text-sm text-muted-foreground">
            Date filters apply to Overall and Franchise tabs only. Rankings use
            the fixed fest period (June 14 – June 20, 2026).
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFilterChange(f)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-2">
              <div className="w-full sm:w-auto">
                <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
              </div>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="w-full sm:w-auto"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

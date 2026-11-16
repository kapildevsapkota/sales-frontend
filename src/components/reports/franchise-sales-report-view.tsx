"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { format, startOfDay, subDays, startOfMonth, endOfMonth, subMonths, isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";

import { api } from "@/lib/api";
import { FranchiseSalesReportItem } from "@/types/franchise-sales-report";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import DateRangePicker from "@/components/ui/date-range-picker";
import {
  RefreshCw,
  ArrowUpDown,
  Download,
  Calendar,
  X,
  Store,
} from "lucide-react";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

interface FranchiseSalesReportViewProps {
  title?: string;
  description?: string;
}

type SortField =
  | "franchise_name"
  | "total_sales"
  | "online_sales"
  | "office_sale";

type DatePreset = "all" | "today" | "yesterday" | "last7" | "thisMonth" | "lastMonth";

export function FranchiseSalesReportView({
  title = "Franchise Sales Report",
  description = "Overview of online and office sales across all franchises with detailed product breakdown",
}: FranchiseSalesReportViewProps) {
  // Date filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activePreset, setActivePreset] = useState<DatePreset>("all");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("total_sales");
  const [sortAsc, setSortAsc] = useState(false);

  // Build API URL with start_date and end_date params
  const endpointUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (dateRange?.from) {
      params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
    }
    if (dateRange?.to) {
      params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
    } else if (dateRange?.from) {
      params.append("end_date", format(dateRange.from, "yyyy-MM-dd"));
    }

    const qs = params.toString();
    return qs
      ? `/api/sales/franchise-sales-report/?${qs}`
      : "/api/sales/franchise-sales-report/";
  }, [dateRange]);

  const {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR<FranchiseSalesReportItem[]>(endpointUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setActivePreset("all");
  };

  const applyPreset = (preset: DatePreset) => {
    setActivePreset(preset);
    const today = new Date();

    if (preset === "all") {
      setDateRange(undefined);
      return;
    }

    let from: Date;
    let to: Date;

    switch (preset) {
      case "today":
        from = startOfDay(today);
        to = startOfDay(today);
        break;
      case "yesterday": {
        const y = subDays(today, 1);
        from = startOfDay(y);
        to = startOfDay(y);
        break;
      }
      case "last7":
        from = startOfDay(subDays(today, 6));
        to = startOfDay(today);
        break;
      case "thisMonth":
        from = startOfMonth(today);
        to = startOfDay(today);
        break;
      case "lastMonth": {
        const lm = subMonths(today, 1);
        from = startOfMonth(lm);
        to = endOfMonth(lm);
        break;
      }
      default:
        return;
    }

    setDateRange({ from, to });
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setActivePreset("all");
  };

  // Sorted items
  const sortedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return [...data].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === "string") {
        return sortAsc
          ? valA.localeCompare(valB as string)
          : (valB as string).localeCompare(valA);
      }
      return sortAsc ? Number(valA || 0) - Number(valB || 0) : Number(valB || 0) - Number(valA || 0);
    });
  }, [data, sortField, sortAsc]);

  // Overall totals
  const totals = useMemo(() => {
    if (!sortedData || !Array.isArray(sortedData)) {
      return { totalSales: 0, onlineSales: 0, officeSales: 0, count: 0 };
    }

    let totalSales = 0;
    let onlineSales = 0;
    let officeSales = 0;

    sortedData.forEach((item) => {
      totalSales += Number(item.total_sales) || 0;
      onlineSales += Number(item.online_sales) || 0;
      officeSales += Number(item.office_sale) || 0;
    });

    return {
      totalSales,
      onlineSales,
      officeSales,
      count: sortedData.length,
    };
  }, [sortedData]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!sortedData || sortedData.length === 0) return;

    const dateSuffix = dateRange?.from
      ? `${format(dateRange.from, "yyyy-MM-dd")}_to_${format(dateRange.to || dateRange.from, "yyyy-MM-dd")}`
      : "all-time";

    const headers = [
      "Franchise Name",
      "Total Sales",
      "Online Sales",
      "Office Sales",
      "Product Breakdown",
    ];

    const rows = sortedData.map((item) => {
      const breakdown = item.product_breakdown
        ? Object.entries(item.product_breakdown)
          .map(([prod, qty]) => `${prod}: ${qty}`)
          .join("; ")
        : "";

      return [
        `"${(item.franchise_name || "").replace(/"/g, '""')}"`,
        item.total_sales,
        item.online_sales,
        item.office_sale,
        `"${breakdown.replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `franchise-sales-report-${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Picker */}
          <div className="w-full sm:w-[250px]">
            <DateRangePicker
              className="w-full h-8.5 text-xs"
              value={dateRange}
              onChange={handleDateRangeChange}
              clearable={true}
              emptyLabel="Filter by date range"
            />
          </div>



          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isValidating}
            className="h-8.5 gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${isValidating ? "animate-spin text-blue-600" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Presets & Active Range Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Presets:</span>
          {(
            [
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "last7", label: "Last 7 Days" },
              { id: "thisMonth", label: "This Month" },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${activePreset === preset.id && (preset.id === "all" ? !dateRange?.from : dateRange?.from)
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {dateRange?.from && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50/80 border border-blue-200/70 text-blue-800 text-[11px]">
            <Calendar className="h-3 w-3 text-blue-600 shrink-0" />
            <span>
              Filtered: <strong>{format(dateRange.from, "MMM d, yyyy")}</strong>
              {dateRange.to && !isSameDay(dateRange.from, dateRange.to) ? (
                <> to <strong>{format(dateRange.to, "MMM d, yyyy")}</strong></>
              ) : null}
            </span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-1 text-blue-600 hover:text-blue-900 font-bold p-0.5 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 shadow-2xs bg-white overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-600" />
              Loading franchise sales reports...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-sm text-rose-500 px-4">
              <p className="font-semibold mb-1">Failed to load franchise sales report</p>
              <p className="text-xs text-slate-400 mb-3">Please check your connection and try again.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                className="h-8 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
              >
                Retry
              </Button>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm px-4">
              <Store className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-slate-700">No franchise sales reports found</p>
              <p className="text-xs text-slate-400 mt-1">
                {dateRange?.from
                  ? "No sales recorded for the selected date range."
                  : "No franchise sales data available."}
              </p>
              {dateRange?.from && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-3 h-8 text-xs"
                >
                  Clear Date Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-b border-slate-200 hover:bg-transparent">
                    <TableHead className="w-[180px] sm:w-[220px] text-xs sm:text-sm py-2.5 px-3.5">
                      <button
                        onClick={() => toggleSort("franchise_name")}
                        className="flex items-center gap-1 font-semibold text-slate-800 hover:text-slate-950 cursor-pointer"
                      >
                        Franchise
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[110px] sm:w-[130px] text-right text-xs sm:text-sm py-2.5 px-3.5">
                      <button
                        onClick={() => toggleSort("total_sales")}
                        className="flex items-center gap-1 font-semibold text-slate-800 hover:text-slate-950 ml-auto cursor-pointer"
                      >
                        Total Orders
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[110px] sm:w-[130px] text-right text-xs sm:text-sm py-2.5 px-3.5">
                      <button
                        onClick={() => toggleSort("online_sales")}
                        className="flex items-center gap-1 font-semibold text-slate-800 hover:text-slate-950 ml-auto cursor-pointer"
                      >
                        Online Orders
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[110px] sm:w-[130px] text-right text-xs sm:text-sm py-2.5 px-3.5">
                      <button
                        onClick={() => toggleSort("office_sale")}
                        className="flex items-center gap-1 font-semibold text-slate-800 hover:text-slate-950 ml-auto cursor-pointer"
                      >
                        Office Orders
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[300px] text-xs sm:text-sm py-2.5 px-3.5 font-semibold text-slate-800">
                      Product Breakdown
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sortedData.map((item, index) => {
                    const products = item.product_breakdown
                      ? Object.entries(item.product_breakdown)
                      : [];

                    return (
                      <TableRow
                        key={item.franchise_id || index}
                        className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Franchise Name */}
                        <TableCell className="font-semibold text-slate-900 py-3 px-3.5 align-top text-sm">
                          {item.franchise_name || "Unknown"}
                        </TableCell>

                        {/* Total Sales */}
                        <TableCell className="text-right py-3 px-3.5 align-top">
                          <span className="text-sm font-bold text-slate-950 font-mono block">
                            {Number(item.total_sales || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Online Sales */}
                        <TableCell className="text-right py-3 px-3.5 align-top">
                          <span className="text-sm font-semibold text-slate-700 font-mono block">
                            {Number(item.online_sales || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Office Sales */}
                        <TableCell className="text-right py-3 px-3.5 align-top">
                          <span className="text-sm font-semibold text-slate-700 font-mono block">
                            {Number(item.office_sale || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Product Breakdown - Clean Table matching requested design */}
                        <TableCell className="py-2.5 px-3.5 align-top">
                          {products.length > 0 ? (
                            <div className="rounded border border-slate-200 bg-white overflow-hidden w-full max-w-sm shadow-2xs">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-50/70">
                                    <th className="text-left py-2 px-3 font-semibold text-slate-900 text-xs">
                                      Product
                                    </th>
                                    <th className="text-right py-2 px-3 font-semibold text-slate-900 text-xs">
                                      Quantity Sold
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {products.map(([prodName, qty]) => (
                                    <tr
                                      key={prodName}
                                      className="hover:bg-slate-50/60 transition-colors"
                                    >
                                      <td className="py-2 px-3 text-slate-800 font-medium leading-snug">
                                        {prodName}
                                      </td>
                                      <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                                        {Number(qty).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No breakdown available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>

                {/* Grand Total Footer */}

              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

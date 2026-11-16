"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { FranchiseSalesReportItem } from "@/types/franchise-sales-report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  RefreshCw,
  Layers,
  ArrowUpDown,
  Download,
} from "lucide-react";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

interface FranchiseSalesReportViewProps {
  title?: string;
  description?: string;
}

export function FranchiseSalesReportView({
  title = "Franchise Sales Report",
  description = "Overview of online and office sales across all franchises with detailed product breakdown",
}: FranchiseSalesReportViewProps) {
  const {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR<FranchiseSalesReportItem[]>(
    "/api/sales/franchise-sales-report/",
    fetcher,
    { revalidateOnFocus: false }
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"total_sales" | "online_sales" | "office_sale" | "franchise_name">("total_sales");
  const [sortAsc, setSortAsc] = useState(false);

  // Filtered & Sorted items
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const query = searchQuery.trim().toLowerCase();
    let list = data;

    if (query) {
      list = list.filter((item) => {
        const matchesName = item.franchise_name?.toLowerCase().includes(query);
        const matchesProducts =
          item.product_breakdown &&
          Object.keys(item.product_breakdown).some((prod) =>
            prod.toLowerCase().includes(query)
          );
        return matchesName || matchesProducts;
      });
    }

    return [...list].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === "string") {
        return sortAsc
          ? valA.localeCompare(valB as string)
          : (valB as string).localeCompare(valA);
      }
      return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });
  }, [data, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) return;

    const headers = ["Franchise Name", "Total Sales", "Online Sales", "Office Sales", "Product Breakdown"];
    const rows = filteredData.map((item) => {
      const breakdown = item.product_breakdown
        ? Object.entries(item.product_breakdown)
            .map(([prod, qty]) => `${prod}: ${qty}`)
            .join("; ")
        : "";
      return [
        `"${item.franchise_name || ""}"`,
        item.total_sales,
        item.online_sales,
        item.office_sale,
        `"${breakdown}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `franchise-sales-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Header section - compact padding, larger title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!data || data.length === 0}
            className="h-8 gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isValidating}
            className="h-8 gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isValidating ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Report Table Card - tight padding, larger readable fonts */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardHeader className="px-3.5 py-3 border-b border-slate-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">
                Franchise Sales Overview
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Showing {filteredData.length} {filteredData.length === 1 ? "franchise" : "franchises"}
              </CardDescription>
            </div>
            <div className="w-full sm:w-72">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search franchise or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs sm:text-sm h-8.5 bg-slate-50/80 border-slate-200 focus-visible:bg-white"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-slate-400" />
              Loading franchise reports...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-rose-500">
              Failed to load franchise sales report. Please try again.
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No franchise sales reports found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-b border-slate-200 hover:bg-transparent">
                    <TableHead className="w-[180px] sm:w-[220px] text-xs sm:text-sm py-2 px-3">
                      <button
                        onClick={() => toggleSort("franchise_name")}
                        className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900"
                      >
                        Franchise
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] sm:w-[120px] text-right text-xs sm:text-sm py-2 px-3">
                      <button
                        onClick={() => toggleSort("total_sales")}
                        className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 ml-auto"
                      >
                        Total Sales
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] sm:w-[120px] text-right text-xs sm:text-sm py-2 px-3">
                      <button
                        onClick={() => toggleSort("online_sales")}
                        className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 ml-auto"
                      >
                        Online Sales
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] sm:w-[120px] text-right text-xs sm:text-sm py-2 px-3">
                      <button
                        onClick={() => toggleSort("office_sale")}
                        className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 ml-auto"
                      >
                        Office Sales
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[420px] text-xs sm:text-sm py-2 px-3">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        Product Breakdown
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => {
                    const products = item.product_breakdown
                      ? Object.entries(item.product_breakdown)
                      : [];

                    return (
                      <TableRow
                        key={item.franchise_id || index}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Franchise Name */}
                        <TableCell className="font-medium text-slate-900 py-2.5 px-3 align-middle">
                          <span className="text-sm font-semibold block leading-snug">
                            {item.franchise_name || "Unknown"}
                          </span>
                        </TableCell>

                        {/* Total Sales */}
                        <TableCell className="text-right py-2.5 px-3 align-middle">
                          <span className="text-sm font-bold text-slate-900 font-mono">
                            {Number(item.total_sales).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Online Sales */}
                        <TableCell className="text-right py-2.5 px-3 align-middle">
                          <span className="text-sm text-slate-600 font-mono">
                            {Number(item.online_sales).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Office Sales */}
                        <TableCell className="text-right py-2.5 px-3 align-middle">
                          <span className="text-sm text-slate-600 font-mono">
                            {Number(item.office_sale).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Product Breakdown - Clean, readable grid layout */}
                        <TableCell className="py-2 px-3 align-middle">
                          {products.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {products.map(([prodName, qty]) => (
                                <div
                                  key={prodName}
                                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-xs sm:text-sm shadow-2xs"
                                >
                                  <span className="text-slate-700 font-medium whitespace-nowrap">
                                    {prodName}
                                  </span>
                                  <span className="font-bold text-slate-950 font-mono shrink-0 pl-1.5 border-l border-slate-200">
                                    {Number(qty).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No breakdown available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

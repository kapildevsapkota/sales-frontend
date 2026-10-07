"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { ArrowLeft } from "lucide-react";
import { FranchiseSalesGrid } from "@/components/salesfest/super-admin/franchise-sales-grid";
import { SalesFestFilters } from "@/components/salesfest/super-admin/sales-fest-filters";
import { Franchise, FranchiseSalesEntry, SalesFilter } from "@/components/salesfest/super-admin/types";
import { useSalesFestData } from "@/components/salesfest/super-admin/use-sales-fest-data";
import { getGroupForFranchise } from "@/components/salesfest/super-admin/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const GROUP_CONFIG: { key: "A" | "B" | "C" | "OTHER"; title: string; color: string }[] = [
  { key: "A", title: "Team A (Shankhamul, Main Page)", color: "bg-blue-50/80 border-blue-200 text-blue-900" },
  { key: "B", title: "Team B (Swoyambhu, Baneshwor, Lagankhel)", color: "bg-indigo-50/80 border-indigo-200 text-indigo-900" },
  { key: "C", title: "Team C (Jorpati, Bhaktapur, Kirtipur, Gairidhara, Sitapaila, Soalteemode, Jhamsikhel)", color: "bg-emerald-50/80 border-emerald-200 text-emerald-900" },
  { key: "OTHER", title: "Other Franchises", color: "bg-gray-50/80 border-gray-200 text-gray-900" },
];

export default function FranchisesGridPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<SalesFilter>("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    franchiseSalesData,
    franchiseSalesLoading,
    franchisesLoading,
  } = useSalesFestData("franchise", filter, dateRange);

  const filterLabel = filter.charAt(0).toUpperCase() + filter.slice(1);
  const hasActiveFilters = filter !== "daily" || !!dateRange?.from;

  const handleFranchiseSelect = (franchise: Franchise) => {
    const params = new URLSearchParams({ name: franchise.name });
    router.push(
      `/super-admin/salesfest/franchise/${franchise.id}?${params.toString()}`,
    );
  };

  const handleClearFilters = () => {
    setFilter("daily");
    setDateRange(undefined);
  };

  const groupedEntries = useMemo(() => {
    const groups: Record<"A" | "B" | "C" | "OTHER", FranchiseSalesEntry[]> = {
      A: [],
      B: [],
      C: [],
      OTHER: [],
    };

    if (franchiseSalesData) {
      franchiseSalesData.forEach((entry) => {
        const group = getGroupForFranchise(entry.franchise) ?? "OTHER";
        groups[group].push(entry);
      });
    }

    return groups;
  }, [franchiseSalesData]);

  const isLoading = franchiseSalesLoading || franchisesLoading;

  return (
    <div className="container mx-auto max-w-[1800px] px-3 sm:px-4 space-y-4 sm:space-y-6 py-4 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" className="w-fit gap-2" asChild>
          <Link href="/super-admin/salesfest">
            <ArrowLeft className="h-4 w-4" />
            Back to Sales Fest
          </Link>
        </Button>
        <div className="sm:text-right">
          <h1 className="text-xl sm:text-2xl font-bold">Franchise Sales Grid (Group Wise)</h1>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of sales and product quantities by team groups
          </p>
        </div>
      </div>

      <SalesFestFilters
        activeTab="franchise"
        filter={filter}
        dateRange={dateRange}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={setFilter}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
      />

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {GROUP_CONFIG.map(({ key, title, color }) => {
            const entries = groupedEntries[key];
            if (!entries || entries.length === 0) return null;

            return (
              <section key={key} className="space-y-3">
                <div className={`px-4 py-2.5 rounded-lg border font-semibold text-sm sm:text-base flex items-center justify-between ${color}`}>
                  <span>{title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 font-medium">
                    {entries.length} {entries.length === 1 ? "Franchise" : "Franchises"}
                  </span>
                </div>
                <FranchiseSalesGrid
                  entries={entries}
                  loading={false}
                  filterLabel={filterLabel}
                  onFranchiseSelect={handleFranchiseSelect}
                  hidePrices={true}
                  showPoints={true}
                />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

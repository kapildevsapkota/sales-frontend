"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";
import { FranchiseSalesGrid } from "@/components/salesfest/super-admin/franchise-sales-grid";
import { SalesFestFilters } from "@/components/salesfest/super-admin/sales-fest-filters";
import {
  Franchise,
  FranchiseSalesEntry,
  SalesFilter,
} from "@/components/salesfest/super-admin/types";
import { useSalesFestData } from "@/components/salesfest/super-admin/use-sales-fest-data";
import { getGroupForFranchise } from "@/components/salesfest/super-admin/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type GroupKey = "A" | "B" | "C";

const GROUP_CONFIG: { key: GroupKey; title: string; color: string }[] = [
  {
    key: "A",
    title: "Team A (Shankhamul, Main Page)",
    color: "bg-blue-50/80 border-blue-200 text-blue-900",
  },
  {
    key: "B",
    title: "Team B (Swoyambhu, Baneshwor, Lagankhel)",
    color: "bg-indigo-50/80 border-indigo-200 text-indigo-900",
  },
  {
    key: "C",
    title:
      "Team C (Jorpati, Bhaktapur, Kirtipur, Gairidhara, Sitapaila, Soalteemode, Jhamsikhel)",
    color: "bg-emerald-50/80 border-emerald-200 text-emerald-900",
  },
];

export default function FranchisesGridPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<SalesFilter>("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);
  const [isAutoRotationActive, setIsAutoRotationActive] =
    useState<boolean>(true);

  const { franchiseSalesData, franchiseSalesLoading, franchisesLoading } =
    useSalesFestData("franchise", filter, dateRange);

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
    const groups: Record<GroupKey, FranchiseSalesEntry[]> = {
      A: [],
      B: [],
      C: [],
    };

    if (franchiseSalesData) {
      franchiseSalesData.forEach((entry) => {
        const group = getGroupForFranchise(entry.franchise);
        if (group && (group === "A" || group === "B" || group === "C")) {
          groups[group].push(entry);
        }
      });
    }

    return groups;
  }, [franchiseSalesData]);

  const isLoading = franchiseSalesLoading || franchisesLoading;

  // Auto rotation timer: switch group every 10 seconds (10000ms)
  useEffect(() => {
    if (!isAutoRotationActive || isLoading) return;

    const interval = setInterval(() => {
      setActiveGroupIndex((prevIndex) => (prevIndex + 1) % GROUP_CONFIG.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoRotationActive, isLoading]);

  const currentGroup = GROUP_CONFIG[activeGroupIndex];
  const currentEntries = groupedEntries[currentGroup.key] ?? [];

  return (
    <div className="container mx-auto max-w-[1800px] px-3 sm:px-4 space-y-4 sm:space-y-6 py-4 pb-6">
      {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="w-fit gap-2" asChild>
            <Link href="/super-admin/salesfest">
              <ArrowLeft className="h-4 w-4" />
              Back to Sales Fest
            </Link>
          </Button>
          <Button
            variant={isAutoRotationActive ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsAutoRotationActive((prev) => !prev)}
            className="gap-1.5 text-xs"
          >
            {isAutoRotationActive ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-600" />
                Pause Auto Rotation
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-600" />
                Play Auto Rotation (10s)
              </>
            )}
          </Button>
        </div>
        <div className="sm:text-right">
          <h1 className="text-xl sm:text-2xl font-bold">
            Franchise Sales Grid (Team View)
          </h1>
          <p className="text-sm text-muted-foreground">
            Auto-rotating group presentation (10s per team)
          </p>
        </div>
      </div> */}

      {/* Group Navigation Tabs */}
      {/* <div className="flex flex-wrap gap-2 items-center justify-between bg-muted/40 p-1.5 rounded-lg border">
        <div className="flex flex-wrap gap-2">
          {GROUP_CONFIG.map((group, index) => {
            const isSelected = index === activeGroupIndex;
            const count = (groupedEntries[group.key] ?? []).length;
            return (
              <Button
                key={group.key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveGroupIndex(index);
                }}
                className={`text-xs gap-1.5 ${
                  isSelected ? "" : "bg-white text-gray-700"
                }`}
              >
                <span>Team {group.key}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        {isAutoRotationActive && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 bg-amber-50 border border-amber-200 rounded text-amber-800 font-medium">
            <RotateCcw className="h-3 w-3 animate-spin text-amber-600" />
            <span>Rotating every 10s</span>
          </div>
        )}
      </div> */}

      {/* <SalesFestFilters
        activeTab="franchise"
        filter={filter}
        dateRange={dateRange}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={setFilter}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
      /> */}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, j) => (
              <Skeleton key={j} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 transition-all duration-300">
          <section className="space-y-4">
            <div
              className={`px-4 py-3 rounded-xl border font-semibold text-sm sm:text-base flex items-center justify-between shadow-sm ${currentGroup.color}`}
            >
              <span className="font-bold">{currentGroup.title}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/80 font-bold border">
                {currentEntries.length}{" "}
                {currentEntries.length === 1 ? "Franchise" : "Franchises"}
              </span>
            </div>

            {currentEntries.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 bg-white rounded-xl border">
                No franchise data available for {currentGroup.title}.
              </div>
            ) : (
              <FranchiseSalesGrid
                entries={currentEntries}
                loading={false}
                filterLabel={filterLabel}
                onFranchiseSelect={handleFranchiseSelect}
                hidePrices={true}
                showPoints={true}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

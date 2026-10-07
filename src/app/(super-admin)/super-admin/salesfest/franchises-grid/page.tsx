"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { FranchiseSalesGrid } from "@/components/salesfest/super-admin/franchise-sales-grid";
import {
  Franchise,
  FranchiseSalesEntry,
  SalesFilter,
} from "@/components/salesfest/super-admin/types";
import { useSalesFestData } from "@/components/salesfest/super-admin/use-sales-fest-data";
import { getFranchiseSalesAmount, getGroupForFranchise } from "@/components/salesfest/super-admin/utils";
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

// Generate 8 fest days: Oct 7 to Oct 14, 2026
const FEST_DAYS = Array.from({ length: 8 }).map((_, i) => {
  const date = new Date(2026, 9, 7 + i); // Oct is month index 9 in JS
  return {
    dayNum: i + 1,
    date,
    label: format(date, "MMM d"),
    fullLabel: format(date, "EEE, MMM d"),
  };
});

export default function FranchisesGridPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<SalesFilter>("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Default to Oct 7, 2026
    const defaultDate = FEST_DAYS[0].date;
    return { from: defaultDate, to: defaultDate };
  });
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);
  const [isAutoRotationActive, setIsAutoRotationActive] =
    useState<boolean>(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);

  const { franchiseSalesData, franchiseSalesLoading, franchisesLoading } =
    useSalesFestData("franchise", filter, dateRange);

  const filterLabel = filter.charAt(0).toUpperCase() + filter.slice(1);

  const handleFranchiseSelect = (franchise: Franchise) => {
    const params = new URLSearchParams({ name: franchise.name });
    router.push(
      `/super-admin/salesfest/franchise/${franchise.id}?${params.toString()}`,
    );
  };

  const handleSelectDay = (dayDate: Date) => {
    setDateRange({ from: dayDate, to: dayDate });
    setFilter("daily");
  };

  const handleSelectOverall = () => {
    setDateRange({
      from: FEST_DAYS[0].date,
      to: FEST_DAYS[FEST_DAYS.length - 1].date,
    });
    setFilter("daily");
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

      // Sort franchises in each group by sales amount descending (highest sales first)
      (Object.keys(groups) as GroupKey[]).forEach((key) => {
        groups[key].sort(
          (a, b) => getFranchiseSalesAmount(b) - getFranchiseSalesAmount(a),
        );
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

  const isOverallSelected =
    dateRange?.from &&
    dateRange?.to &&
    isSameDay(dateRange.from, FEST_DAYS[0].date) &&
    isSameDay(dateRange.to, FEST_DAYS[FEST_DAYS.length - 1].date);

  return (
    <div className="container mx-auto max-w-[1800px] px-3 sm:px-4 space-y-4 py-3 pb-6 relative">
      {/* Floating Toggle Header Visibility Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsHeaderVisible((prev) => !prev)}
          className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7"
        >
          {isHeaderVisible ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              Hide Top Headers
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 text-primary" />
              Show Top Headers & Filters
            </>
          )}
        </Button>
      </div>

      {/* Header controls & 8-Day Date Bar */}
      {isHeaderVisible && (
        <>
          <div className="bg-white rounded-xl border p-3 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  asChild
                >
                  <Link href="/super-admin/salesfest">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </Link>
                </Button>
                <h1 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Sales Fest Daily Grid</span>
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isAutoRotationActive ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setIsAutoRotationActive((prev) => !prev)}
                  className="gap-1.5 text-xs h-8"
                >
                  {isAutoRotationActive ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-amber-600" />
                      Pause 10s Cycle
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-emerald-600" />
                      Play 10s Cycle
                    </>
                  )}
                </Button>
                {isAutoRotationActive && (
                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded font-medium">
                    <RotateCcw className="h-3 w-3 animate-spin text-amber-600" />
                    <span>Auto Team Cycle</span>
                  </div>
                )}
              </div>
            </div>

            {/* 8-Day Date Filter Selector Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-9 gap-1.5">
              {FEST_DAYS.map((day) => {
                const isSelected =
                  !isOverallSelected &&
                  dateRange?.from &&
                  isSameDay(dateRange.from, day.date);

                return (
                  <button
                    key={day.dayNum}
                    type="button"
                    onClick={() => handleSelectDay(day.date)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold ring-2 ring-primary/20"
                        : "bg-gray-50/80 hover:bg-gray-100 border-gray-200 text-gray-700 font-medium"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider opacity-80">
                      Day {day.dayNum}
                    </span>
                    <span className="text-xs font-bold whitespace-nowrap">
                      {day.label}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleSelectOverall}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                  isOverallSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm font-semibold ring-2 ring-primary/20"
                    : "bg-gray-50/80 hover:bg-gray-100 border-gray-200 text-gray-700 font-medium"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-80">
                  Total
                </span>
                <span className="text-xs font-bold whitespace-nowrap">
                  Oct 7-14
                </span>
              </button>
            </div>
          </div>

          {/* Team Group Selector Tabs */}
          <div className="flex flex-wrap gap-2 items-center justify-between bg-muted/40 p-1.5 rounded-lg border">
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
          </div>
        </>
      )}

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

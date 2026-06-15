"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";
import { LayoutGrid, Store, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FestRankingsSection } from "./fest-rankings-section";
import { FranchiseLeaderboard } from "./franchise-leaderboard";
import { FranchiseSalesGrid } from "./franchise-sales-grid";
import { SalesFestFilters } from "./sales-fest-filters";
import { SalesFestHeader } from "./sales-fest-header";
import { StatisticsSection } from "./statistics-section";
import { TopSalespersonsList } from "./top-salespersons-list";
import { Franchise, SalesFilter, ViewTab } from "./types";
import { useSalesFestData } from "./use-sales-fest-data";

export function SuperAdminSalesFestView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [filter, setFilter] = useState<SalesFilter>("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const {
    franchises,
    franchisesLoading,
    overallStats,
    overallStatsLoading,
    overallTopSales,
    overallTopSalesLoading,
    franchiseLeaderboard,
    leaderboardLoading,
    franchiseSalesData,
    franchiseSalesLoading,
    rankingsData,
    rankingsLoading,
    totalFranchiseRevenue,
  } = useSalesFestData(activeTab, filter, dateRange);

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

  return (
    <div className="container mx-auto max-w-[1800px] px-3 sm:px-4 space-y-4 sm:space-y-6 pb-6">
      <SalesFestHeader franchiseCount={franchises.length} />

      <SalesFestFilters
        activeTab={activeTab}
        filter={filter}
        dateRange={dateRange}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={setFilter}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ViewTab)}
        className="space-y-4 sm:space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 h-auto sm:h-11 gap-1 p-1">
          <TabsTrigger
            value="overview"
            className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0"
          >
            <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Overall
          </TabsTrigger>
          <TabsTrigger
            value="franchise"
            className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0"
          >
            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Franchise
          </TabsTrigger>
          <TabsTrigger
            value="rankings"
            className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-0"
          >
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
          <StatisticsSection
            statistics={overallStats}
            loading={overallStatsLoading}
          />
          <FranchiseLeaderboard
            entries={franchiseLeaderboard ?? []}
            loading={leaderboardLoading || franchisesLoading}
            totalRevenue={totalFranchiseRevenue}
            onSelectFranchise={() => setActiveTab("franchise")}
          />
          <TopSalespersonsList
            salespersons={overallTopSales?.results ?? []}
            loading={overallTopSalesLoading}
            subtitle={`${filterLabel} performance · All franchises`}
          />
        </TabsContent>

        <TabsContent value="franchise" className="space-y-4 sm:space-y-6 mt-0">
          <FranchiseSalesGrid
            entries={franchiseSalesData ?? []}
            loading={franchiseSalesLoading || franchisesLoading}
            filterLabel={filterLabel}
            onFranchiseSelect={handleFranchiseSelect}
          />
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4 sm:space-y-6 mt-0">
          <FestRankingsSection
            entries={rankingsData ?? []}
            loading={rankingsLoading || franchisesLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

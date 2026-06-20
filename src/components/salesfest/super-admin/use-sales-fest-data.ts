import { useMemo } from "react";
import useSWR from "swr";
import { DateRange } from "react-day-picker";
import { api } from "@/lib/api";
import { Statistics } from "@/components/dashboard/types";
import { REFRESH_INTERVAL } from "./constants";
import {
  Franchise,
  FranchiseSalesEntry,
  FranchiseStatsEntry,
  SalesFilter,
  TopSalespersonsResponse,
  ViewTab,
} from "./types";
import {
  buildOverviewParams,
  buildRankingsParams,
  fetcher,
  getFranchiseSalesAmount,
  isHiddenFranchise,
  sortSalespersonsByAmount,
} from "./utils";

export function useSalesFestData(
  activeTab: ViewTab,
  filter: SalesFilter,
  dateRange: DateRange | undefined,
) {
  const { data: franchisesData, isLoading: franchisesLoading } = useSWR<
    Franchise[] | { results?: Franchise[] }
  >("/api/account/my-franchises/", fetcher, {
    refreshInterval: REFRESH_INTERVAL,
  });

  const franchises = useMemo((): Franchise[] => {
    if (!franchisesData) return [];
    const raw = Array.isArray(franchisesData)
      ? franchisesData
      : (franchisesData.results ?? []);
    return raw.filter((f) => !isHiddenFranchise(f.name));
  }, [franchisesData]);

  const overviewFilterKey = buildOverviewParams(filter, dateRange);
  const rankingsFilterKey = buildRankingsParams();
  const franchiseIds = franchises.map((f) => f.id).join(",");

  const { data: overallStats, isLoading: overallStatsLoading } =
    useSWR<Statistics>(`/api/sales/statistics/?${overviewFilterKey}`, fetcher, {
      refreshInterval: REFRESH_INTERVAL,
    });

  const { data: overallTopSales, isLoading: overallTopSalesLoading } =
    useSWR<TopSalespersonsResponse>(
      `/api/sales/top-salespersons/?${overviewFilterKey}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVAL },
    );

  const { data: franchiseLeaderboard, isLoading: leaderboardLoading } = useSWR<
    FranchiseStatsEntry[]
  >(
    franchises.length > 0
      ? ["franchise-leaderboard", franchiseIds, overviewFilterKey]
      : null,
    async () => {
      const entries = await Promise.all(
        franchises.map(async (franchise) => {
          try {
            const params = buildOverviewParams(
              filter,
              dateRange,
              franchise.id.toString(),
            );
            const { data } = await api.get<Statistics>(
              `/api/sales/statistics/?${params}`,
            );
            return { franchise, statistics: data };
          } catch {
            return null;
          }
        }),
      );
      return entries
        .filter((e): e is FranchiseStatsEntry => e !== null)
        .sort((a, b) => b.statistics.total_sales - a.statistics.total_sales);
    },
    { refreshInterval: REFRESH_INTERVAL },
  );

  const { data: franchiseSalesData, isLoading: franchiseSalesLoading } = useSWR<
    FranchiseSalesEntry[]
  >(
    activeTab === "franchise" && franchises.length > 0
      ? ["franchise-sales-all", franchiseIds, overviewFilterKey]
      : null,
    async () => {
      const entries = await Promise.all(
        franchises.map(async (franchise) => {
          const filterParams = buildOverviewParams(
            filter,
            dateRange,
            franchise.id.toString(),
          );
          try {
            const [statsRes, topRes] = await Promise.all([
              api.get<Statistics>(`/api/sales/statistics/?${filterParams}`),
              api.get<TopSalespersonsResponse>(
                `/api/sales/top-salespersons/?${filterParams}`,
              ),
            ]);
            return {
              franchise,
              statistics: statsRes.data,
              salespersons: sortSalespersonsByAmount(topRes.data.results ?? []),
            };
          } catch {
            return {
              franchise,
              statistics: null,
              salespersons: [],
            };
          }
        }),
      );
      return entries.sort(
        (a, b) => getFranchiseSalesAmount(b) - getFranchiseSalesAmount(a),
      );
    },
    { refreshInterval: REFRESH_INTERVAL },
  );

  const { data: rankingsData, isLoading: rankingsLoading } = useSWR<
    FranchiseSalesEntry[]
  >(
    activeTab === "rankings" && franchises.length > 0
      ? ["fest-rankings", franchiseIds, rankingsFilterKey]
      : null,
    async () => {
      const entries = await Promise.all(
        franchises.map(async (franchise) => {
          const filterParams = buildRankingsParams(franchise.id.toString());
          try {
            const [statsRes, topRes] = await Promise.all([
              api.get<Statistics>(`/api/sales/statistics/?${filterParams}`),
              api.get<TopSalespersonsResponse>(
                `/api/sales/top-salespersons/?${filterParams}`,
              ),
            ]);
            return {
              franchise,
              statistics: statsRes.data,
              salespersons: sortSalespersonsByAmount(topRes.data.results ?? []),
            };
          } catch {
            return {
              franchise,
              statistics: null,
              salespersons: [],
            };
          }
        }),
      );
      return entries;
    },
    { refreshInterval: REFRESH_INTERVAL },
  );

  const totalFranchiseRevenue =
    franchiseLeaderboard?.reduce(
      (sum, e) => sum + e.statistics.total_sales,
      0,
    ) ?? 0;

  return {
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
  };
}

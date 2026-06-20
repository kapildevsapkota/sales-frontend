import { format, isAfter, isBefore, parseISO, startOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { api } from "@/lib/api";
import {
  GROUP_A_FRANCHISE_MATCHERS,
  HIDDEN_FRANCHISE_NAMES,
  RANKINGS_END_DATE,
  RANKINGS_START_DATE,
} from "./constants";
import {
  Franchise,
  FranchiseSalesEntry,
  RevenueTrendPoint,
  SalesFilter,
  Salesperson,
} from "./types";

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const formatCurrency = (value: number) =>
  `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const formatNumber = (value: number) => value.toLocaleString("en-IN");

export const formatCompactCurrency = (value: number) => {
  if (value >= 1_000_000) return `Rs. ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Rs. ${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
};

export const formatChartDate = (period: string) => {
  try {
    return format(parseISO(period), "MMM d");
  } catch {
    return period;
  }
};

export const isHiddenFranchise = (name: string) =>
  HIDDEN_FRANCHISE_NAMES.has(name.trim().toLowerCase());

export const getFranchiseLabel = (franchise: Franchise) =>
  `${franchise.name} ${franchise.short_form ?? ""}`.trim().toLowerCase();

export const isGroupAFranchise = (franchise: Franchise) =>
  GROUP_A_FRANCHISE_MATCHERS.some((matcher) =>
    getFranchiseLabel(franchise).includes(matcher),
  );

export const getFranchiseSalesAmount = (entry: FranchiseSalesEntry) =>
  entry.salespersons.reduce((sum, sp) => sum + sp.total_sales, 0) ||
  (entry.statistics?.total_sales ?? 0);

export const sortSalespersonsByAmount = <T extends Salesperson>(salespersons: T[]) =>
  [...salespersons].sort((a, b) => b.total_sales - a.total_sales);

export const calcTrend = (current: number, previous: number) => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};

function appendFestDateRange(params: URLSearchParams) {
  params.append("start_date", format(RANKINGS_START_DATE, "yyyy-MM-dd"));
  params.append("end_date", format(RANKINGS_END_DATE, "yyyy-MM-dd"));
}

function appendOverviewDateRange(
  params: URLSearchParams,
  dateRange: DateRange | undefined,
) {
  if (dateRange?.from) {
    params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange.to && dateRange.to !== dateRange.from) {
      params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
    }
    return;
  }

  params.append("start_date", format(startOfDay(new Date()), "yyyy-MM-dd"));
}

export function buildOverviewParams(
  filter: SalesFilter,
  dateRange: DateRange | undefined,
  franchiseId?: string,
) {
  const params = new URLSearchParams();
  params.append("filter", filter);
  if (franchiseId) params.append("franchise", franchiseId);
  appendOverviewDateRange(params, dateRange);
  return params.toString();
}

export function buildRankingsParams(franchiseId?: string) {
  const params = new URLSearchParams();
  params.append("filter", "all");
  appendFestDateRange(params);
  if (franchiseId) params.append("franchise", franchiseId);
  return params.toString();
}

export function buildFestTrendParams() {
  const params = new URLSearchParams();
  params.append("filter", "daily");
  appendFestDateRange(params);
  return params.toString();
}

export function filterFestTrendPoints(points: RevenueTrendPoint[]) {
  const festStart = startOfDay(RANKINGS_START_DATE);
  const festEnd = startOfDay(RANKINGS_END_DATE);

  return points
    .filter((point) => {
      try {
        const pointDate = startOfDay(parseISO(point.period));
        return (
          !isBefore(pointDate, festStart) && !isAfter(pointDate, festEnd)
        );
      } catch {
        return false;
      }
    })
    .sort(
      (a, b) =>
        parseISO(a.period).getTime() - parseISO(b.period).getTime(),
    );
}

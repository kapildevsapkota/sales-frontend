"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  DollarSign,
  LayoutGrid,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { Statistics } from "@/components/dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DateRangePicker from "@/components/ui/date-range-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Franchise {
  id: number;
  name: string;
  short_form: string | null;
  distributor: number;
}

interface ProductSale {
  product_name: string;
  quantity_sold: number;
}

interface Salesperson {
  first_name: string;
  last_name: string;
  total_sales: number;
  sales_count: number;
  product_sales: ProductSale[];
}

interface TopSalespersonsResponse {
  filter_type: "all" | "daily" | "weekly" | "monthly";
  results: Salesperson[];
}

interface FranchiseStatsEntry {
  franchise: Franchise;
  statistics: Statistics;
}

interface FranchiseSalesEntry {
  franchise: Franchise;
  statistics: Statistics | null;
  salespersons: Salesperson[];
}

type SalesFilter = "all" | "daily" | "weekly" | "monthly";
type ViewTab = "overview" | "franchise";

const HIDDEN_FRANCHISE_NAMES = new Set([
  "biratnagar",
  "chibe traders pvt. ltd.",
]);

const REFRESH_INTERVAL = 60_000;

const isHiddenFranchise = (name: string) =>
  HIDDEN_FRANCHISE_NAMES.has(name.trim().toLowerCase());

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const formatCurrency = (value: number) =>
  `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatNumber = (value: number) => value.toLocaleString("en-IN");

const rankStyles = [
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-slate-50 border-slate-200 text-slate-700",
  "bg-orange-50 border-orange-200 text-orange-700",
];

const getFranchiseSalesAmount = (entry: FranchiseSalesEntry) =>
  entry.salespersons.reduce((sum, sp) => sum + sp.total_sales, 0) ||
  (entry.statistics?.total_sales ?? 0);

const sortSalespersonsByAmount = (salespersons: Salesperson[]) =>
  [...salespersons].sort((a, b) => b.total_sales - a.total_sales);

function buildTopSalesParams(
  filter: SalesFilter,
  dateRange: DateRange | undefined,
  franchiseId?: string
) {
  const params = new URLSearchParams();
  params.append("filter", filter);
  if (franchiseId) params.append("franchise", franchiseId);
  if (dateRange?.from) {
    params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
  }
  if (dateRange?.to && dateRange.to !== dateRange.from) {
    params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
  }
  return params.toString();
}

function calcTrend(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function StatCard({
  label,
  value,
  sublabel,
  icon,
  trend,
  footer,
  className,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  footer?: string;
  className?: string;
}) {
  const isPositive = trend ? trend.value >= 0 : undefined;

  return (
    <Card className={`shadow-sm border ${className ?? ""}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
          )}
        </div>
        <div className="rounded-full bg-muted p-2">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {isPositive ? (
              <ArrowUp className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-600" />
            )}
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {footer && (
          <p className="text-xs text-muted-foreground mt-2">{footer}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-full mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatisticsSection({
  statistics,
  loading,
}: {
  statistics?: Statistics;
  loading: boolean;
}) {
  if (loading) return <StatsSkeleton />;
  if (!statistics) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Unable to load statistics.
        </CardContent>
      </Card>
    );
  }

  const salesTrend = calcTrend(
    statistics.total_sales,
    statistics.total_sales_yesterday
  );
  const ordersTrend = calcTrend(
    statistics.total_orders,
    statistics.total_orders_yesterday
  );

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue Today"
          sublabel={statistics.date}
          value={formatCurrency(statistics.total_sales)}
          icon={<DollarSign className="h-4 w-4 text-green-600" />}
          trend={{ value: salesTrend, label: "vs yesterday" }}
          footer={`Yesterday: ${formatCurrency(statistics.total_sales_yesterday)}`}
          className="border-green-100"
        />
        <StatCard
          label="Orders Today"
          sublabel={statistics.date}
          value={formatNumber(statistics.total_orders)}
          icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
          trend={{ value: ordersTrend, label: "vs yesterday" }}
          footer={`Yesterday: ${formatNumber(statistics.total_orders_yesterday)} orders`}
          className="border-blue-100"
        />
        <StatCard
          label="All-Time Orders"
          value={formatNumber(statistics.all_time_orders)}
          icon={<Package className="h-4 w-4 text-purple-600" />}
          footer={`Cancelled: ${formatNumber(statistics.cancelled_orders_count)}`}
          className="border-purple-100"
        />
        <StatCard
          label="All-Time Revenue"
          value={formatCurrency(statistics.all_time_sales)}
          icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
          footer={`Cancelled: ${formatCurrency(statistics.all_time_cancelled_sales)}`}
          className="border-amber-100"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              Cancelled Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(statistics.cancelled_orders).map(([key, count]) => (
                <div
                  key={key}
                  className="rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <p className="text-xs text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-lg font-semibold">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-red-500" />
              Cancelled Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(statistics.cancelled_amount).map(([key, amount]) => (
                <div
                  key={key}
                  className="rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <p className="text-xs text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function TopSalespersonsList({
  salespersons,
  loading,
  subtitle,
}: {
  salespersons: Salesperson[];
  loading: boolean;
  subtitle: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Top Salespersons
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : salespersons.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No salesperson data found for this period.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {salespersons.map((sp, idx) => (
              <AccordionItem
                key={`${sp.first_name}-${sp.last_name}-${idx}`}
                value={`${sp.first_name}-${sp.last_name}-${idx}`}
                className={`rounded-xl border px-4 ${
                  idx < 3 ? rankStyles[idx] : "bg-white"
                }`}
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex w-full items-center justify-between gap-4 pr-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          idx === 0
                            ? "bg-amber-400 text-white"
                            : idx === 1
                              ? "bg-slate-400 text-white"
                              : idx === 2
                                ? "bg-orange-400 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="text-left min-w-0">
                        <p className="font-semibold truncate">
                          {sp.first_name} {sp.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sp.sales_count} order
                          {sp.sales_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary">
                        {formatCurrency(sp.total_sales)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sp.product_sales.length} product
                        {sp.product_sales.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto pb-2">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-2 pr-4 font-medium">
                            Product
                          </th>
                          <th className="text-right py-2 font-medium">
                            Qty Sold
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sp.product_sales.length === 0 ? (
                          <tr>
                            <td
                              colSpan={2}
                              className="py-3 text-muted-foreground"
                            >
                              No product sales
                            </td>
                          </tr>
                        ) : (
                          sp.product_sales.map((product, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-2 pr-4">
                                {product.product_name}
                              </td>
                              <td className="py-2 text-right font-medium">
                                {product.quantity_sold}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

function FranchiseSalesGrid({
  entries,
  loading,
  filterLabel,
  onFranchiseSelect,
}: {
  entries: FranchiseSalesEntry[];
  loading: boolean;
  filterLabel: string;
  onFranchiseSelect: (franchise: Franchise) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          No franchise data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {entries.map((entry) => (
        <div
          key={entry.franchise.id}
          className="bg-white rounded-xl shadow-sm p-3 h-fit border min-w-0"
        >
          <button
            type="button"
            onClick={() => onFranchiseSelect(entry.franchise)}
            className="mb-3 w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-left transition-colors hover:from-blue-100 hover:to-indigo-100 cursor-pointer"
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">
              {entry.franchise.name}
            </h3>
            {entry.franchise.short_form && (
              <p className="text-xs text-muted-foreground mb-2">
                {entry.franchise.short_form}
              </p>
            )}
            {entry.statistics ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-orange-600">Orders:</span>
                  <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-semibold">
                    {formatNumber(entry.statistics.total_orders)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-purple-600">Sales:</span>
                  <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-semibold text-[11px]">
                    {formatCurrency(entry.statistics.total_sales)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Stats unavailable</p>
            )}
            <p className="text-[11px] text-primary font-medium mt-2">
              Click to view orders
            </p>
          </button>

          <p className="text-xs text-muted-foreground mb-3 px-1">
            {filterLabel} · Top salespersons
          </p>

          <Accordion type="single" collapsible className="w-full">
            {entry.salespersons.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-sm">
                No sales data found for this franchise.
              </div>
            ) : (
              entry.salespersons.map((sp, idx) => (
                <AccordionItem
                  key={idx}
                  value={`${entry.franchise.id}-${sp.first_name}-${sp.last_name}-${idx}`}
                >
                  <AccordionTrigger className="text-xs hover:no-underline py-2">
                    <div className="flex flex-col w-full justify-between gap-1 pr-2">
                      <span className="font-medium text-xs text-left truncate">
                        {sp.first_name} {sp.last_name}
                      </span>
                      <div className="flex flex-col text-[11px]">
                        <span className="text-gray-500">
                          Sales:{" "}
                          <span className="font-semibold text-primary">
                            {formatCurrency(sp.total_sales)}
                          </span>
                        </span>
                        <span className="text-gray-500">
                          Orders:{" "}
                          <span className="font-semibold">{sp.sales_count}</span>
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1 px-1">Product</th>
                            <th className="text-left py-1 px-1">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sp.product_sales.length === 0 ? (
                            <tr>
                              <td
                                colSpan={2}
                                className="py-1 px-1 text-gray-400 text-xs"
                              >
                                No product sales
                              </td>
                            </tr>
                          ) : (
                            sp.product_sales.map((ps, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-1 px-1 text-xs">
                                  {ps.product_name}
                                </td>
                                <td className="py-1 px-1 text-xs">
                                  {ps.quantity_sold}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </div>
      ))}
    </div>
  );
}

function FranchiseLeaderboard({
  entries,
  loading,
  totalRevenue,
  onSelectFranchise,
}: {
  entries: FranchiseStatsEntry[];
  loading: boolean;
  totalRevenue: number;
  onSelectFranchise: () => void;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Franchise Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Today&apos;s sales ranked across all franchises
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            No franchise data available.
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Franchise</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right w-32">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, idx) => {
                  const share =
                    totalRevenue > 0
                      ? (entry.statistics.total_sales / totalRevenue) * 100
                      : 0;
                  const ordersTrend = calcTrend(
                    entry.statistics.total_orders,
                    entry.statistics.total_orders_yesterday
                  );

                  return (
                    <TableRow
                      key={entry.franchise.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={onSelectFranchise}
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {entry.franchise.name}
                        </div>
                        {entry.franchise.short_form && (
                          <div className="text-xs text-muted-foreground">
                            {entry.franchise.short_form}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {formatNumber(entry.statistics.total_orders)}
                        </div>
                        <div
                          className={`text-xs ${
                            ordersTrend >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {ordersTrend >= 0 ? "+" : ""}
                          {ordersTrend.toFixed(0)}% vs yesterday
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(entry.statistics.total_sales)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-medium">
                            {share.toFixed(1)}%
                          </span>
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${Math.min(share, 100)}%` }}
                            />
                          </div>
                        </div>
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
  );
}

export function SuperAdminSalesFestView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ViewTab>("overview");
  const [filter, setFilter] = useState<SalesFilter>("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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

  const overviewTopSalesKey = buildTopSalesParams(filter, dateRange);
  const franchiseIds = franchises.map((f) => f.id).join(",");

  const { data: overallStats, isLoading: overallStatsLoading } =
    useSWR<Statistics>("/api/sales/statistics/", fetcher, {
      refreshInterval: REFRESH_INTERVAL,
    });

  const { data: overallTopSales, isLoading: overallTopSalesLoading } =
    useSWR<TopSalespersonsResponse>(
      `/api/sales/top-salespersons/?${overviewTopSalesKey}`,
      fetcher,
      { refreshInterval: REFRESH_INTERVAL }
    );

  const { data: franchiseLeaderboard, isLoading: leaderboardLoading } = useSWR<
    FranchiseStatsEntry[]
  >(
    franchises.length > 0 ? ["franchise-leaderboard", franchiseIds] : null,
    async () => {
      const entries = await Promise.all(
        franchises.map(async (franchise) => {
          try {
            const { data } = await api.get<Statistics>(
              `/api/sales/statistics/?franchise=${franchise.id}`
            );
            return { franchise, statistics: data };
          } catch {
            return null;
          }
        })
      );
      return entries
        .filter((e): e is FranchiseStatsEntry => e !== null)
        .sort((a, b) => b.statistics.total_sales - a.statistics.total_sales);
    },
    { refreshInterval: REFRESH_INTERVAL }
  );

  const { data: franchiseSalesData, isLoading: franchiseSalesLoading } = useSWR<
    FranchiseSalesEntry[]
  >(
    activeTab === "franchise" && franchises.length > 0
      ? ["franchise-sales-all", franchiseIds, overviewTopSalesKey]
      : null,
    async () => {
      const entries = await Promise.all(
        franchises.map(async (franchise) => {
          const topParams = buildTopSalesParams(
            filter,
            dateRange,
            franchise.id.toString()
          );
          try {
            const [statsRes, topRes] = await Promise.all([
              api.get<Statistics>(
                `/api/sales/statistics/?franchise=${franchise.id}`
              ),
              api.get<TopSalespersonsResponse>(
                `/api/sales/top-salespersons/?${topParams}`
              ),
            ]);
            return {
              franchise,
              statistics: statsRes.data,
              salespersons: sortSalespersonsByAmount(
                topRes.data.results ?? []
              ),
            };
          } catch {
            return {
              franchise,
              statistics: null,
              salespersons: [],
            };
          }
        })
      );
      return entries.sort(
        (a, b) => getFranchiseSalesAmount(b) - getFranchiseSalesAmount(a)
      );
    },
    { refreshInterval: REFRESH_INTERVAL }
  );

  const filterLabel = filter.charAt(0).toUpperCase() + filter.slice(1);

  const handleFranchiseSelect = (franchise: Franchise) => {
    const params = new URLSearchParams({
      name: franchise.name,
    });
    router.push(
      `/super-admin/salesfest/franchise/${franchise.id}?${params.toString()}`
    );
  };

  const totalFranchiseRevenue =
    franchiseLeaderboard?.reduce(
      (sum, e) => sum + e.statistics.total_sales,
      0
    ) ?? 0;

  return (
    <div className="container mx-auto max-w-[1800px] space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            Sales Fest
          </h1>
          <p className="text-muted-foreground mt-1">
            Overall network performance and franchise-wise breakdown
          </p>
        </div>
        <Badge variant="secondary" className="w-fit text-sm px-3 py-1">
          <Store className="h-3.5 w-3.5 mr-1.5" />
          {franchises.length} franchise{franchises.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["daily", "weekly", "monthly", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ViewTab)}
        className="space-y-6"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 h-11">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Overall
          </TabsTrigger>
          <TabsTrigger value="franchise" className="gap-2">
            <Store className="h-4 w-4" />
            Franchise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
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

        <TabsContent value="franchise" className="space-y-6 mt-0">
          <FranchiseSalesGrid
            entries={franchiseSalesData ?? []}
            loading={franchiseSalesLoading || franchisesLoading}
            filterLabel={filterLabel}
            onFranchiseSelect={handleFranchiseSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

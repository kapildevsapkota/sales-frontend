"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  REFRESH_INTERVAL,
  RANKINGS_END_DATE,
  RANKINGS_START_DATE,
} from "./constants";
import { RevenueTrendResponse } from "./types";
import {
  buildFestTrendParams,
  fetcher,
  filterFestTrendPoints,
  formatChartDate,
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from "./utils";

export function FestSalesTrendChart() {
  const trendParams = buildFestTrendParams();

  const { data, isLoading } = useSWR<RevenueTrendResponse>(
    `/api/sales/revenue/?${trendParams}`,
    fetcher,
    { refreshInterval: REFRESH_INTERVAL },
  );

  const chartData = useMemo(() => {
    const points = filterFestTrendPoints(data?.data ?? []);
    let cumulative = 0;

    return points.map((point) => {
      cumulative += point.total_revenue;
      return {
        date: formatChartDate(point.period),
        revenue: point.total_revenue,
        orders: point.order_count,
        cumulative,
      };
    });
  }, [data]);

  const totals = useMemo(() => {
    const revenue = chartData.reduce((sum, point) => sum + point.revenue, 0);
    const orders = chartData.reduce((sum, point) => sum + point.orders, 0);
    const days = chartData.length || 1;

    return { revenue, orders, avgDaily: revenue / days };
  }, [chartData]);

  const periodLabel = `${format(RANKINGS_START_DATE, "MMM d, yyyy")} – ${format(RANKINGS_END_DATE, "MMM d, yyyy")}`;

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 shrink-0" />
              Fest Sales Trend
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {periodLabel}
            </p>
          </div>
          {!isLoading && chartData.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-6">
              <div>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Total revenue
                </p>
                <p className="text-sm sm:text-lg font-bold text-indigo-600">
                  {formatCurrency(totals.revenue)}
                </p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Total orders
                </p>
                <p className="text-sm sm:text-lg font-bold">
                  {formatNumber(totals.orders)}
                </p>
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  Daily average
                </p>
                <p className="text-sm sm:text-lg font-bold">
                  {formatCurrency(totals.avgDaily)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-4 sm:pb-6">
        {isLoading ? (
          <Skeleton className="h-[220px] sm:h-[280px] w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[220px] sm:h-[280px] items-center justify-center text-sm text-muted-foreground px-4 text-center">
            No sales data for this period yet.
          </div>
        ) : (
          <div className="h-[220px] sm:h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="festRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  dy={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  tickFormatter={formatCompactCurrency}
                  width={56}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0].payload as (typeof chartData)[number];

                    return (
                      <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-xs sm:text-sm">
                        <p className="font-medium mb-1">{point.date}</p>
                        <p className="text-indigo-600">
                          Revenue: {formatCurrency(point.revenue)}
                        </p>
                        <p className="text-muted-foreground">
                          Orders: {formatNumber(point.orders)}
                        </p>
                        <p className="text-muted-foreground">
                          Cumulative: {formatCurrency(point.cumulative)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#festRevenueFill)"
                  dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#4f46e5" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

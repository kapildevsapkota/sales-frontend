import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Statistics } from "@/components/dashboard/types";
import { useEffect } from "react";
import { useState } from "react";

export function DashboardStatsPanels({ id }: { id?: string }) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `https://zone-kind-centuries-finding.trycloudflare.com/api/sales/statistics/${id ? `?franchise=${id}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      console.log(result);
      setStatistics(result);
    };

    fetchStatistics();
  }, []);

  const formatCurrency = (value: number) => `Rs. ${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Today */}
        <div className="rounded-xl p-5 bg-gradient-to-br from-green-50 to-green-100 shadow-md border border-green-200 flex flex-col gap-2 min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Revenue Today
            </span>
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {statistics ? formatCurrency(statistics.total_sales) : "--"}
          </div>
          {statistics && (
            <div className="flex items-center text-xs">
              {statistics.total_sales >= statistics.total_sales_yesterday ? (
                <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span
                className={
                  statistics.total_sales >= statistics.total_sales_yesterday
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {(
                  ((statistics.total_sales - statistics.total_sales_yesterday) /
                    (statistics.total_sales_yesterday || 1)) *
                  100
                ).toFixed(1)}
                % vs yesterday
              </span>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Yesterday:{" "}
            {statistics
              ? formatCurrency(statistics.total_sales_yesterday)
              : "--"}
          </div>
        </div>

        {/* Orders Today */}
        <div className="rounded-xl p-5 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md border border-blue-200 flex flex-col gap-2 min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Orders Today
            </span>
            <ShoppingCart className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {statistics ? formatNumber(statistics.total_orders) : "--"}
          </div>
          {statistics && (
            <div className="flex items-center text-xs">
              {statistics.total_orders >= statistics.total_orders_yesterday ? (
                <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span
                className={
                  statistics.total_orders >= statistics.total_orders_yesterday
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {(
                  ((statistics.total_orders -
                    statistics.total_orders_yesterday) /
                    (statistics.total_orders_yesterday || 1)) *
                  100
                ).toFixed(1)}
                % vs yesterday
              </span>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Yesterday:{" "}
            {statistics
              ? formatNumber(statistics.total_orders_yesterday)
              : "--"}
          </div>
        </div>

        {/* All Time Orders */}
        <div className="rounded-xl p-5 bg-gradient-to-br from-purple-50 to-purple-100 shadow-md border border-purple-200 flex flex-col gap-2 min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Active Orders
            </span>
            <Users className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {statistics ? formatNumber(statistics.all_time_orders) : "--"}
          </div>
          <div className="text-xs text-green-600 font-medium">
            <Users className="inline mr-1 h-3 w-3" />
            {statistics
              ? (
                ((statistics.all_time_orders -
                  statistics.cancelled_orders_count) /
                  statistics.all_time_orders) *
                100
              ).toFixed(1)
              : "--"}
            % success rate
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total:{" "}
            {statistics
              ? formatNumber(
                statistics.all_time_orders + statistics.cancelled_orders_count
              )
              : "--"}{" "}
            | Cancelled:{" "}
            {statistics
              ? formatNumber(statistics.cancelled_orders_count)
              : "--"}
          </div>
        </div>

        {/* All Time Sales */}
        <div className="rounded-xl p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-md border border-yellow-200 flex flex-col gap-2 min-h-[160px]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Net Revenue
            </span>
            <Package className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {statistics ? formatCurrency(statistics.all_time_sales) : "--"}
          </div>
          <div className="text-xs text-green-600 font-medium">
            <Package className="inline mr-1 h-3 w-3" />
            {statistics
              ? (
                ((statistics.all_time_sales -
                  statistics.all_time_cancelled_sales) /
                  statistics.all_time_sales) *
                100
              ).toFixed(1)
              : "--"}
            % of gross sales
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Gross:{" "}
            {statistics
              ? formatCurrency(
                statistics.all_time_sales +
                statistics.all_time_cancelled_sales
              )
              : "--"}{" "}
            | Lost:{" "}
            {statistics
              ? formatCurrency(statistics.all_time_cancelled_sales)
              : "--"}
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 grid-cols-1 ">
        {/* Cancelled Orders Breakdown */}

        {/* Key Insights */}
        <div className="rounded-xl p-5 bg-gradient-to-br from-gray-50 to-gray-100 shadow-md border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
            Key Insights
          </h3>

          {statistics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Avg Order Value
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    statistics.total_sales / (statistics.total_orders || 1)
                  )}
                </div>
                <div className="text-xs text-gray-500">Today</div>
              </div>

              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Active Order Value
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    (statistics.all_time_sales -
                      statistics.all_time_cancelled_sales) /
                    (statistics.all_time_orders -
                      statistics.cancelled_orders_count || 1)
                  )}
                </div>
                <div className="text-xs text-gray-500">Per Active Order</div>
              </div>

              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Revenue Loss
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {statistics
                    ? (
                      (statistics.all_time_cancelled_sales /
                        statistics.all_time_sales) *
                      100
                    ).toFixed(1)
                    : "--"}
                  %
                </div>
                <div className="text-xs text-gray-500">
                  {statistics
                    ? formatCurrency(statistics.all_time_cancelled_sales)
                    : "--"}
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Daily Performance
                </div>
                <div
                  className={`text-2xl font-bold ${statistics.total_sales >= statistics.total_sales_yesterday
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {statistics.total_sales >= statistics.total_sales_yesterday
                    ? "↗️ Better"
                    : "↘️ Lower"}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.abs(
                    ((statistics.total_sales -
                      statistics.total_sales_yesterday) /
                      (statistics.total_sales_yesterday || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Order Efficiency
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {statistics
                    ? (
                      ((statistics.all_time_orders -
                        statistics.cancelled_orders_count) /
                        statistics.all_time_orders) *
                      100
                    ).toFixed(1)
                    : "--"}
                  %
                </div>
                <div className="text-xs text-gray-500">
                  {statistics
                    ? formatNumber(
                      statistics.all_time_orders -
                      statistics.cancelled_orders_count
                    )
                    : "--"}{" "}
                  of{" "}
                  {statistics ? formatNumber(statistics.all_time_orders) : "--"}
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Cancellation Impact
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(
                    statistics.all_time_cancelled_sales /
                    (statistics.cancelled_orders_count || 1)
                  )}
                </div>
                <div className="text-xs text-gray-500">Avg Loss Per Cancel</div>
              </div>

              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Today&apos;s Contribution
                </div>
                <div className="text-2xl font-bold text-teal-600">
                  {statistics
                    ? (
                      (statistics.total_sales /
                        (statistics.all_time_sales -
                          statistics.all_time_cancelled_sales)) *
                      100
                    ).toFixed(2)
                    : "--"}
                  %
                </div>
                <div className="text-xs text-gray-500">Of Net Revenue</div>
              </div>

              <div className="p-4 bg-white rounded-lg border text-center">
                <div className="text-sm font-semibold text-gray-600">
                  Revenue Quality
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {statistics
                    ? (
                      ((statistics.all_time_sales -
                        statistics.all_time_cancelled_sales) /
                        statistics.all_time_sales) *
                      100
                    ).toFixed(1)
                    : "--"}
                  %
                </div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Statistics } from "@/components/dashboard/types";
import { useEffect } from "react";
import { useState } from "react";

export function DashboardStatsPanels({}) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        "https://sales.baliyoventures.com/api/sales/statistics/",
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

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue Today */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-green-50 to-green-100 shadow-sm flex flex-col gap-2 min-h-[140px]">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700">
            Total Revenue Today
          </span>
          <DollarSign className="h-6 w-6 text-green-400" />
        </div>
        <div className="text-3xl font-bold text-gray-900">
          Rs. {statistics ? statistics.total_sales.toFixed(2) : "--"}
        </div>
        {statistics && (
          <div className="flex items-center text-sm">
            {statistics.total_sales >= statistics.total_sales_yesterday ? (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span
              className={
                statistics.total_sales >= statistics.total_sales_yesterday
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              Rs.{" "}
              {Math.abs(
                statistics.total_sales - statistics.total_sales_yesterday
              ).toFixed(2)}{" "}
              (
              {statistics.total_sales >= statistics.total_sales_yesterday
                ? "+"
                : ""}
              {(
                ((statistics.total_sales - statistics.total_sales_yesterday) /
                  (statistics.total_sales_yesterday || 1)) *
                100
              ).toFixed(1)}
              % ) from yesterday
            </span>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          Yesterday: Rs.{" "}
          {statistics ? statistics.total_sales_yesterday.toFixed(2) : "--"}
        </div>
      </div>

      {/* Orders Today */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm flex flex-col gap-2 min-h-[140px]">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700">
            Orders Today
          </span>
          <ShoppingCart className="h-6 w-6 text-blue-400" />
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {statistics ? statistics.total_orders : "--"}
        </div>
        {statistics && (
          <div className="flex items-center text-sm">
            {statistics.total_orders >= statistics.total_orders_yesterday ? (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            )}
            <span
              className={
                statistics.total_orders >= statistics.total_orders_yesterday
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {Math.abs(
                statistics.total_orders - statistics.total_orders_yesterday
              )}{" "}
              (
              {statistics.total_orders >= statistics.total_orders_yesterday
                ? "+"
                : ""}
              {(
                ((statistics.total_orders - statistics.total_orders_yesterday) /
                  (statistics.total_orders_yesterday || 1)) *
                100
              ).toFixed(1)}
              % ) from yesterday
            </span>
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">
          Yesterday: {statistics ? statistics.total_orders_yesterday : "--"}
        </div>
      </div>

      {/* All Time Orders */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm flex flex-col gap-2 min-h-[140px]">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700">
            All Time Orders
          </span>
          <Users className="h-6 w-6 text-purple-400" />
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {statistics ? statistics.all_time_orders : "--"}
        </div>
        <div className="flex items-center text-sm text-green-600">
          <ArrowUp className="mr-1 h-4 w-4" />+
          {statistics
            ? (
                (statistics.all_time_orders /
                  (statistics.all_time_orders - 1 || 1)) *
                100
              ).toFixed(1)
            : "--"}
          % from last month
        </div>
      </div>

      {/* All Time Sales */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-sm flex flex-col gap-2 min-h-[140px]">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700">
            All Time Sales
          </span>
          <Package className="h-6 w-6 text-yellow-400" />
        </div>
        <div className="text-3xl font-bold text-gray-900">
          Rs. {statistics ? statistics.all_time_sales : "--"}
        </div>
        <div className="flex items-center text-sm text-red-600">
          <ArrowDown className="mr-1 h-4 w-4" />-
          {statistics
            ? (
                (statistics.all_time_sales /
                  (statistics.all_time_sales + 1 || 1)) *
                10
              ).toFixed(1)
            : "--"}
          % from last month
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { TopProducts } from "@/components/dashboard/top-products";

interface Statistics {
  date: string;
  total_orders: number;
  total_orders_yesterday: number;
  total_sales: number;
  total_sales_yesterday: number;
  all_time_orders: number;
  all_time_sales: number;
}

interface DashboardContentProps {
  className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  className,
}) => {
  const [timeframe, setTimeframe] = useState<
    "monthly" | "weekly" | "yearly" | "daily"
  >("daily");
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
  }, [timeframe]);

  return (
    <main className={`flex-1 overflow-auto ${className || ""}`}>
      <div className="container mx-auto space-y-6  sm:p-4 md:p-6 2xl:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight md:text-3xl">
            Sales Dashboard
          </h1>
        </div>

        {/* Modern Stat Panels */}
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
                    ((statistics.total_sales -
                      statistics.total_sales_yesterday) /
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
                {statistics.total_orders >=
                statistics.total_orders_yesterday ? (
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
                    ((statistics.total_orders -
                      statistics.total_orders_yesterday) /
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

        {/* Sales Overview and Top Sales Persons */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-full lg:col-span-4 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0 overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Sales Overview
                </div>
                <div className="text-sm text-gray-500">
                  Monthly sales performance
                </div>
              </div>
              <Tabs
                defaultValue={timeframe}
                onValueChange={(value) =>
                  setTimeframe(
                    value as "monthly" | "weekly" | "yearly" | "daily"
                  )
                }
                className="w-full sm:w-auto mt-4 sm:mt-0"
              >
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="overflow-x-auto w-full min-w-[320px]">
              <SalesChart timeframe={timeframe} />
            </div>
          </div>
          <div className="col-span-full lg:col-span-3 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0">
            <div className="mb-4">
              <div className="text-lg font-semibold text-gray-900">
                Top Sales Persons
              </div>
              <div className="text-sm text-gray-500">Sales by persons</div>
            </div>
            <RecentSales />
          </div>
        </div>

        {/* Top Products and Revenue by Category */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-full lg:col-span-3 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0">
            <div className="mb-4">
              <div className="text-lg font-semibold text-gray-900">
                Top Products
              </div>
              <div className="text-sm text-gray-500">
                Your best selling products this month
              </div>
            </div>
            <TopProducts />
          </div>
          <div className="col-span-full lg:col-span-4 rounded-2xl p-5 bg-white shadow-sm flex flex-col min-w-0">
            <div className="mb-4">
              <div className="text-lg font-semibold text-gray-900">
                Revenue by Category
              </div>
              <div className="text-sm text-gray-500">
                Revenue distribution across product categories
              </div>
            </div>
            <div className="px-0 sm:px-6 overflow-x-auto w-full min-w-[320px]">
              <RevenueChart />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { TopProducts } from "@/components/dashboard/top-products";

interface Statistics {
  date: string;
  total_orders: number;
  total_sales: number;
  all_time_orders: number;
  all_time_sales: number;
}

interface DashboardContentProps {
  className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  className,
}) => {
  const [timeframe, setTimeframe] = useState("week");
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
      setStatistics(result);
    };

    fetchStatistics();
  }, []);

  return (
    <main className={`flex-1 overflow-auto ${className || ""}`}>
      <div className="container mx-auto space-y-6 p-4 md:p-6 2xl:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Sales Dashboard
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs.{" "}
                {statistics ? statistics.total_sales.toFixed(2) : "Loading..."}
              </div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>
                  {statistics
                    ? `+${(
                        (statistics.total_sales /
                          (statistics.total_sales - 1)) *
                        100
                      ).toFixed(1)}% from last month`
                    : "Loading..."}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics ? statistics.total_orders : "Loading..."}
              </div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>
                  {statistics
                    ? `+${(
                        (statistics.total_orders /
                          (statistics.total_orders - 1)) *
                        100
                      ).toFixed(1)}% from last month`
                    : "Loading..."}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics ? statistics.all_time_orders : "Loading..."}
              </div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>
                  {statistics
                    ? `+${(
                        (statistics.all_time_orders /
                          (statistics.all_time_orders - 1)) *
                        100
                      ).toFixed(1)}% from last month`
                    : "Loading..."}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                All Time Sales
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {statistics ? statistics.all_time_sales : "Loading..."}
              </div>
              <div className="flex items-center text-xs text-red-500">
                <ArrowDown className="mr-1 h-3 w-3" />
                <span>
                  {statistics
                    ? `-${(
                        (statistics.all_time_sales /
                          (statistics.all_time_sales + 1)) *
                        10
                      ).toFixed(1)}% from last month`
                    : "Loading..."}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-full lg:col-span-4">
            <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </div>
              <Tabs
                defaultValue={timeframe}
                onValueChange={setTimeframe}
                className="w-full sm:w-auto"
              >
                <TabsList className="w-full sm:w-auto"></TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <SalesChart timeframe={timeframe} />
            </CardContent>
          </Card>
          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle>Top Sales Persons</CardTitle>
              <CardDescription>You made 265 sales this month</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentSales />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>
                Your best selling products this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopProducts />
            </CardContent>
          </Card>
          <Card className="col-span-full lg:col-span-4">
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>
                Revenue distribution across product categories
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <RevenueChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

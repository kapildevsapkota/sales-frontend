"use client";

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { TopProducts } from "@/components/dashboard/top-products";

interface DashboardContentProps {
  className?: string;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  className,
}) => {
  const [timeframe, setTimeframe] = useState("week");

  return (
    <main className={`flex-1 overflow-auto ${className || ""}`}>
      <div className="container mx-auto space-y-6 p-4 md:p-6 2xl:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Sales Dashboard
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Button variant="outline" className="w-full sm:w-auto">
              Export
            </Button>
            <Button className="w-full sm:w-auto">Generate Report</Button>
          </div>
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
              <div className="text-2xl font-bold">$45,231.89</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+20.1% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+12.2% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span>+4.6% from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <div className="flex items-center text-xs text-red-500">
                <ArrowDown className="mr-1 h-3 w-3" />
                <span>-2.5% from last month</span>
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
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="week" className="flex-1 sm:flex-none">
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="flex-1 sm:flex-none">
                    Month
                  </TabsTrigger>
                  <TabsTrigger value="year" className="flex-1 sm:flex-none">
                    Year
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <SalesChart timeframe={timeframe} />
            </CardContent>
          </Card>
          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
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

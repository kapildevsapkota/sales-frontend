"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StatsData {
  date: string;
  total_orders: number;
  total_sales: number;
  all_time_orders: number;
  all_time_sales: number;
  // Added fields for comparison with previous period
  previous_day_orders?: number;
  previous_day_sales?: number;
}

export function Stats() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const authToken = localStorage.getItem("accessToken");
        const response = await fetch(
          "https://sales.baliyoventures.com/api/sales/statistics/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();

        // For demo purposes, adding mock previous day data
        // In a real app, this would come from the API
        setStatsData({
          ...data,
          previous_day_orders: data.total_orders * 0.9, // Simulating 10% growth
          previous_day_sales: data.total_sales * 0.85, // Simulating 15% growth
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate percentage changes
  const getPercentageChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">Sales Dashboard</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Unable to load sales data</h2>
        <p className="text-muted-foreground">
          Please check your connection and try again.
        </p>
      </div>
    );
  }

  const orderChange = getPercentageChange(
    statsData.total_orders,
    statsData.previous_day_orders || 0
  );
  const salesChange = getPercentageChange(
    statsData.total_sales,
    statsData.previous_day_sales || 0
  );

  const stats = [
    {
      label: "Today's Orders",
      sublabel: statsData.date,
      value: statsData.total_orders.toString(),
      icon: <Package className="h-5 w-5 text-primary" />,
      change: orderChange,
      trend: orderChange >= 0 ? "up" : "down",
      description: `${Math.abs(orderChange).toFixed(1)}% vs yesterday`,
    },
    {
      label: "Today's Revenue",
      sublabel: statsData.date,
      value: `Rs. ${statsData.total_sales.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
      change: salesChange,
      trend: salesChange >= 0 ? "up" : "down",
      description: `${Math.abs(salesChange).toFixed(1)}% vs yesterday`,
    },
    {
      label: "Lifetime Orders",
      sublabel: "All time",
      value: statsData.all_time_orders.toLocaleString("en-IN"),
      icon: <CreditCard className="h-5 w-5 text-indigo-500" />,
      description: "Total completed orders",
    },
    {
      label: "Lifetime Revenue",
      sublabel: "All time",
      value: `Rs. ${statsData.all_time_sales.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp className="h-5 w-5 text-amber-500" />,
      description: "Total revenue generated",
    },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sales Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-l-4"
            style={{
              borderLeftColor:
                stat.trend === "up"
                  ? "hsl(var(--emerald-500))"
                  : stat.trend === "down"
                  ? "hsl(var(--destructive))"
                  : "hsl(var(--primary))",
            }}
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
              <div className="rounded-full bg-muted p-2">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>
                {stat.change !== undefined && (
                  <div
                    className={`flex items-center text-xs font-medium ${
                      stat.trend === "up"
                        ? "text-emerald-500"
                        : "text-destructive"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(stat.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>

              <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    stat.trend === "up"
                      ? "bg-gradient-to-r from-emerald-500/50 to-emerald-500"
                      : stat.trend === "down"
                      ? "bg-gradient-to-r from-destructive/50 to-destructive"
                      : "bg-gradient-to-r from-primary/50 to-primary"
                  }`}
                  style={{
                    width: stat.change
                      ? `${Math.min(Math.abs(stat.change) * 2, 100)}%`
                      : "70%",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

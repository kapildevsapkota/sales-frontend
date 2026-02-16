"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, DollarSign, Package, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsData {
  date: string;
  total_orders: number;
  total_sales: number;
  all_time_orders: number;
  all_time_sales: number;
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
          "https://zone-kind-centuries-finding.trycloudflare.com/api/sales/statistics/",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const data = await response.json();
        setStatsData(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  const stats = [
    {
      label: "Today's Orders",
      sublabel: statsData.date,
      value: statsData.total_orders.toString(),
      icon: <Package className="h-5 w-5 text-primary" />,
    },
    {
      label: "Today's Revenue",
      sublabel: statsData.date,
      value: `Rs. ${statsData.total_sales.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
    },
    {
      label: "Lifetime Orders",
      sublabel: "All time",
      value: statsData.all_time_orders.toLocaleString("en-IN"),
      icon: <CreditCard className="h-5 w-5 text-indigo-500" />,
    },
    {
      label: "Lifetime Revenue",
      sublabel: "All time",
      value: `Rs. ${statsData.all_time_sales.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUp className="h-5 w-5 text-amber-500" />,
    },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Sales Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-l-4 bg-white/90 dark:bg-background rounded-2xl shadow-md"
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    {stat.label}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {stat.sublabel}
                  </p>
                </div>
                <div className="rounded-full bg-muted p-2 shadow-sm">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

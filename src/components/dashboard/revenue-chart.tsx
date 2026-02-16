"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Define the interface for the product data
interface Product {
  color: string | undefined;
  product_name: string;
  revenue: number;
  percentage: number; // Include percentage if needed
}

export function RevenueChart({ id }: { id?: string }) {
  const [data, setData] = useState<Product[]>([]); // State to hold revenue data
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken"); // Get the access token from local storage
        const response = await fetch(
          `https://zone-kind-centuries-finding.trycloudflare.com/api/sales/revenue-by-product/?filter=${timeRange}${id ? `&franchise=${id}` : ""
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Set the authorization header
            },
          }
        );
        const result = await response.json();
        const chartData = (result.products || []).map((product: Product) => ({
          name: product.product_name,
          value: product.revenue,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Generate a random color for each product
        }));
        setData(chartData); // Update state with fetched revenue data
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        setData([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, [timeRange, id]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <Tabs
          defaultValue="weekly"
          onValueChange={(value) => setTimeRange(value as "weekly" | "monthly")}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[250px] sm:h-[300px] w-full min-w-0 flex items-center justify-center overflow-x-auto">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="space-y-4">
              <Skeleton className="h-[160px] sm:h-[200px] w-[160px] sm:w-[200px] rounded-full" />
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(2)}%`
                }
                labelLine={false}
              >
                {(data || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Product
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].name}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Revenue
                            </span>
                            <span className="font-bold">
                              Rs.{" "}
                              {typeof payload[0].value === "number"
                                ? payload[0].value.toFixed(3)
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

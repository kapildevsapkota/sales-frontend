"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  FranchiseDayDataWithDate,
  FranchiseDaysResponse,
} from "@/types/ydm-dashboard/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

class DashboardService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";

  static async getOrderChartData(id: number): Promise<FranchiseDaysResponse> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const response = await fetch(
      `${this.baseURL}/api/logistics/franchise/${id}/daily-stats/`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${text || "Failed to fetch order chart data"}`
      );
    }

    return response.json();
  }
}

const transformDataForChart = (
  apiData: FranchiseDaysResponse | null | undefined
): FranchiseDayDataWithDate[] => {
  if (!apiData || !apiData.days) {
    return [];
  }

  return apiData.days.map((day) => ({
    date: day.date,
    count: day.count,
  }));
};

export function OrderChart({ id }: { id: number }) {
  const [orderChartData, setOrderChartData] =
    useState<FranchiseDaysResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const response = await DashboardService.getOrderChartData(id);
      setOrderChartData(response);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      console.error("Error fetching chart data:", err);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  const refetch = async () => {
    setIsRefetching(true);
    await fetchChartData();
  };

  useEffect(() => {
    fetchChartData();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading chart data: {error?.message || "Unknown error"}
        <button
          onClick={() => refetch()}
          className="block mx-auto mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const chartData = transformDataForChart(orderChartData);

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm border-0 rounded-xl overflow-hidden p-0">
        <CardHeader className="bg-primary text-white py-3">
          <CardTitle className="text-center font-semibold text-sm">
            Daily Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-64 flex items-center justify-center text-slate-500">
            No chart data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0 rounded-xl overflow-hidden p-0">
      <CardHeader className="bg-primary text-white py-3">
        <CardTitle className="text-center font-semibold text-sm">
          Daily Order Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  const dateParts = value.split("-");
                  return dateParts.length === 3 ? dateParts[2] : value;
                }}
              />
              <YAxis tick={{ fontSize: 11 }} domain={[0, "dataMax + 1"]} />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                }}
                formatter={(value) => [value, "Orders"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="oklch(0.7686 0.1647 70.0804)"
                strokeWidth={3}
                dot={{ fill: "black", strokeWidth: 2, r: 5 }}
                activeDot={{
                  r: 6,
                  stroke: "oklch(0.7686 0.1647 70.0804)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-slate-600 text-center">
          Franchise ID: {orderChartData?.franchise_id || "N/A"} | Total Days:{" "}
          {chartData.length} |{isRefetching && " Refreshing..."}
        </div>
      </CardContent>
    </Card>
  );
}

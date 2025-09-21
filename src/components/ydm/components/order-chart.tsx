"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}

interface OrderChartData {
  date: string;
  active_count: number;
  cancelled_count: number;
  total_count: number;
  active_revenue: string;
  cancelled_revenue: string;
  total_revenue: string;
  active_orders: Record<string, number>;
  cancelled_orders: Record<string, number>;
}

interface OrderChartResponse {
  filter_type: string;
  data: OrderChartData[];
}

class DashboardService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";

  static async getOrderChartData(id: number): Promise<OrderChartResponse> {
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

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-40">
        <div className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1">
          {label}
        </div>

        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-700">{entry.name}:</span>
              </div>
              <span className="font-medium text-gray-900">
                {Math.abs(entry.value || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const transformDataForChart = (
  apiData: OrderChartResponse | null | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] => {
  if (!apiData || !apiData.data) {
    return [];
  }

  return apiData.data.map((item) => {
    const transformed = {
      date: item.date,
      // Active orders (positive values)
      sent_to_ydm: item.active_orders?.sent_to_ydm || 0,
      verified: item.active_orders?.verified || 0,
      out_for_delivery: item.active_orders?.out_for_delivery || 0,
      rescheduled: item.active_orders?.rescheduled || 0,
      delivered: item.active_orders?.delivered || 0,
      // Cancelled orders (negative values for stackOffset="sign")
      cancelled: -(item.cancelled_orders?.cancelled || 0),
      returned_by_customer: -(item.cancelled_orders?.returned_by_customer || 0),
      returned_by_ydm: -(item.cancelled_orders?.returned_by_ydm || 0),
      return_pending: -(item.cancelled_orders?.return_pending || 0),
      // Keep original data for tooltip
      originalData: item,
    };
    return transformed;
  });
};

export function OrderChart({ id }: { id: number }) {
  const [orderChartData, setOrderChartData] =
    useState<OrderChartResponse | null>(null);
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
    return (
      <Card className="shadow-sm border-0 rounded-xl overflow-hidden p-0">
        <CardHeader className="bg-primary text-white py-3">
          <CardTitle className="text-center font-semibold text-sm">
            Daily Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-64 flex items-center justify-center text-slate-500">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
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
      <CardHeader className="bg-primary text-white py-3 relative">
        <CardTitle className="text-center font-semibold text-sm">
          Daily Order Status
        </CardTitle>
        {isRefetching && (
          <div className="absolute top-2 right-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              stackOffset="sign"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  const dateParts = value.split("-");
                  return dateParts.length === 3 ? dateParts[2] : value;
                }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                content={<CustomTooltip />}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                iconType="rect"
              />
              <ReferenceLine y={0} stroke="#000" strokeWidth={1} />

              {/* Active Orders - Stacked together (positive values) */}
              <Bar
                dataKey="sent_to_ydm"
                stackId="stack"
                fill="#F5C527"
                name="Sent to YDM"
              />
              <Bar
                dataKey="verified"
                stackId="stack"
                fill="#0BF44D"
                name="Verified"
              />
              <Bar
                dataKey="out_for_delivery"
                stackId="stack"
                fill="#63F89A"
                name="Out for Delivery"
              />
              <Bar
                dataKey="rescheduled"
                stackId="stack"
                fill="#27A6F5"
                name="Rescheduled"
              />
              <Bar
                dataKey="delivered"
                stackId="stack"
                fill="#09C83F"
                name="Delivered"
              />

              {/* Cancelled Orders - Stacked together (negative values) */}
              <Bar
                dataKey="cancelled"
                stackId="stack"
                fill="#F4320B"
                name="Cancelled"
              />
              <Bar
                dataKey="returned_by_customer"
                stackId="stack"
                fill="#F54927"
                name="Returned by Customer"
              />
              <Bar
                dataKey="returned_by_ydm"
                stackId="stack"
                fill="#F87C63"
                name="Returned by YDM"
              />
              <Bar
                dataKey="return_pending"
                stackId="stack"
                fill="#FAA18F"
                name="Return Pending"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ReferenceLine,
} from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Define the type for revenue data
interface RevenueData {
  period: string;
  total_revenue: number;
  order_count: number;
  cancelled_count: number;
}

export function DashboardBarChart({ timeframe }: { timeframe: string }) {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        const queryParams = `filter=${timeframe}`;
        const response = await api.get(
          `/api/sales/revenue-with-cancelled/?${queryParams}`
        );
        console.log("sales person revenue", response.data);
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching salesperson revenue:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, [timeframe]);

  // Transform data for the chart
  const chartData = data.map((item) => ({
    name: item.period,
    orders: item.order_count,
    cancelled: -item.cancelled_count, // Negative value to show below the line
    ...item, // Spread all fields for tooltip access
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <p className="text-gray-500">Loading chart data...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <p className="text-gray-500">
          No data available for the selected criteria
        </p>
      </div>
    );
  }

  return (
    <div className="h-[250px] sm:h-[300px] w-full min-w-0 overflow-x-auto">
      <style>{`.recharts-tooltip-wrapper { transition: none !important; pointer-events: none; } .recharts-tooltip-wrapper:hover { opacity: 1 !important; } .recharts`}</style>
      <ResponsiveContainer width="100%" height="100%" minWidth={320}>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 50,
          }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={14}
                  textAnchor="end"
                  fill="#888888"
                  fontSize={10}
                  transform="rotate(-35)"
                >
                  {payload.value}
                </text>
              </g>
            )}
          />
          <YAxis
            stroke="#888888"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${Math.abs(value as number)}`}
          />
          <ReferenceLine y={0} stroke="#888888" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                if (hoveredBar === "orders") {
                  return (
                    <div className="rounded-lg border bg-white p-2">
                      <div>
                        <div className="font-bold text-sm mb-1">
                          Orders: {data.order_count} <br />
                          Amount: {data.total_revenue}
                        </div>
                        <div className="text-xs">Active Orders:</div>
                        <ul className="text-xs">
                          {data.active_orders &&
                            (Object.entries(data.active_orders).map(
                              ([key, value]: [string, unknown]) => (
                                <li key={key}>
                                  {key}: {String(value)}
                                </li>
                              )
                            ) as React.ReactNode[])}
                        </ul>
                      </div>
                    </div>
                  );
                } else if (hoveredBar === "cancelled") {
                  return (
                    <div className="rounded-lg border bg-white p-2">
                      <div>
                        <div className="font-bold text-sm mb-1">
                          Cancelled: {data.cancelled_count} <br />
                          Cancelled Amount: {data.total_cancelled_amount}
                        </div>
                        <div className="text-xs"></div>
                        <div className="text-xs">Cancelled Orders:</div>
                        <ul className="text-xs">
                          {data.cancelled_orders &&
                            (Object.entries(data.cancelled_orders).map(
                              ([key, value]: [string, unknown]) => (
                                <li key={key}>
                                  {key}: {String(value)}
                                </li>
                              )
                            ) as React.ReactNode[])}
                        </ul>
                      </div>
                    </div>
                  );
                }
              }
              return null;
            }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar
            dataKey="orders"
            fill="#A3D977"
            name="Orders"
            radius={[4, 4, 0, 0]}
            onMouseOver={() => setHoveredBar("orders")}
            onMouseOut={() => setHoveredBar(null)}
          />
          <Bar
            dataKey="cancelled"
            fill="#F08080"
            name="Cancelled"
            radius={[4, 4, 0, 0]}
            onMouseOver={() => setHoveredBar("cancelled")}
            onMouseOut={() => setHoveredBar(null)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

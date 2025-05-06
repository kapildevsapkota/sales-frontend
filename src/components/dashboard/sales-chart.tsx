"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";

// Define the type for revenue data
interface RevenueData {
  period: string;
  total_revenue: number;
  order_count: number;
}

export function SalesChart({ timeframe }: { timeframe: string }) {
  const [data, setData] = useState<RevenueData[]>([]); // State to hold revenue data

  useEffect(() => {
    const fetchRevenueData = async () => {
      const token = localStorage.getItem("accessToken"); // Get the access token from local storage
      const response = await fetch(
        `https://sales.baliyoventures.com/api/sales/revenue/?filter=${timeframe}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the authorization header
          },
        }
      );
      const result = await response.json();
      console.log("sales chart", result);
      setData(result.data); // Update state with fetched revenue data
    };

    fetchRevenueData();
  }, [timeframe]);

  // Transform data for the chart based on the timeframe
  const chartData = data.map((item) => ({
    name: item.period,
    sales: item.total_revenue,
    orders: item.order_count,
  }));

  return (
    <div className="h-[250px] sm:h-[300px] w-full min-w-0 overflow-x-auto">
      <ResponsiveContainer width="100%" height="100%" minWidth={320}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={14}
                  textAnchor="middle"
                  fill="#888888"
                  fontSize={10}
                  className="sm:text-[12px]"
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
            tickFormatter={(value) => `Rs.${value}`}
            width={48}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].payload.name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Revenue
                        </span>
                        <span className="font-bold">
                          Rs. {payload[0].value}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Orders
                        </span>
                        <span className="font-bold">{payload[1].value}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, style: { fill: "hsl(var(--primary))" } }}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, style: { fill: "hsl(var(--secondary))" } }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

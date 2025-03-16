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

export function SalesChart({}: { timeframe: string }) {
  const [data, setData] = useState<RevenueData[]>([]); // State to hold revenue data

  useEffect(() => {
    const fetchRevenueData = async () => {
      const token = localStorage.getItem("accessToken"); // Get the access token from local storage
      const response = await fetch(
        "https://sales.baliyoventures.com/api/sales/revenue/",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the authorization header
          },
        }
      );
      const result = await response.json();
      setData(result.data); // Update state with fetched revenue data
    };

    fetchRevenueData();
  }, []);

  // Transform data for the chart based on the timeframe
  const chartData = data.map((item) => ({
    name: item.period,
    sales: item.total_revenue,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
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
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="middle"
                  fill="#888888"
                  fontSize={12}
                >
                  {payload.value}
                </text>
              </g>
            )}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Rs.${value}`}
            width={60}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {payload[0].name}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

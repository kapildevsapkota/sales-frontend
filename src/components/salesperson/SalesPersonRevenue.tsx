"use client";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Area,
} from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { format } from "date-fns";

// Define the type for revenue data
interface RevenueData {
  period: string;
  total_revenue: number;
  order_count: number;
}

export function SalesPersonRevenue({
  timeframe,
  phoneNumber,
  date,
}: {
  timeframe: string;
  phoneNumber: string;
  date: Date | undefined;
}) {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        // Build query parameters
        let queryParams = `filter=${timeframe}`;

        // Add date filter if it exists
        if (date) {
          queryParams += `&date=${format(date, "yyyy-MM-dd")}`;
        }

        const response = await api.get(
          `/api/sales/salesperson/${phoneNumber}/revenue/?${queryParams}`
        );
        console.log("sales person revenue", response.data);
        // Update this line to access `.data` instead of `.revenue_data`
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching salesperson revenue:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenueData();
  }, [timeframe, phoneNumber, date]);

  // Transform data for the chart based on the timeframe
  const chartData = data.map((item) => ({
    name: item.period,
    sales: item.total_revenue,
    orders: item.order_count,
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
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E42" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F59E42" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            yAxisId="left"
          />
          <YAxis
            orientation="right"
            stroke="#F59E42"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            width={48}
            yAxisId="right"
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
                          <span style={{ color: "#4F46E5" }}>Revenue</span>
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: "#4F46E5" }}
                        >
                          Rs. {payload[0].value}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          <span style={{ color: "#F59E42" }}>Orders</span>
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: "#F59E42" }}
                        >
                          {payload[1].value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#4F46E5"
            fillOpacity={0.2}
            fill="url(#colorSales)"
            isAnimationActive={false}
            yAxisId="left"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#F59E42"
            fillOpacity={0.2}
            fill="url(#colorOrders)"
            isAnimationActive={false}
            yAxisId="right"
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#4F46E5"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, style: { fill: "#4F46E5" } }}
            name="Sales"
            yAxisId="left"
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#F59E42"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, style: { fill: "#F59E42" } }}
            name="Orders"
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

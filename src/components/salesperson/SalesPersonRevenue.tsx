"use client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DateRange } from "react-day-picker";

// Define the type for revenue data
interface RevenueData {
  period: string;
  total_revenue: number;
  order_count: number;
  cancelled_count: number;
  total_cancelled_amount?: number;
  active_orders?: Record<string, unknown>;
  cancelled_orders?: Record<string, unknown>;
}

// Define proper types for Recharts tooltip payload
interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  payload: RevenueData & {
    name: string;
    orders: number;
    cancelled: number;
  };
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-lg">
        <div className="text-sm font-semibold text-gray-900 mb-3 border-b pb-2">
          {label}
        </div>

        <div className="space-y-3">
          {/* Side-by-side Active and Cancelled Data */}
          <div className="grid grid-cols-2 gap-4">
            {/* Active Orders Column */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#22c55e" }}
                />
                <div className="text-sm font-medium text-gray-900">
                  Active Orders
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Count:{" "}
                <span className="font-medium">{data.order_count || 0}</span>
              </div>
              <div className="text-xs text-gray-600">
                Revenue:{" "}
                <span className="font-medium">
                  Rs. {data.total_revenue?.toLocaleString() || "0"}
                </span>
              </div>
              {data.active_orders &&
                Object.keys(data.active_orders).length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Breakdown:</div>
                    <div className="space-y-0.5">
                      {Object.entries(data.active_orders)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-gray-600 truncate max-w-[60px]">
                              {key}:
                            </span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Cancelled Orders Column */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "#ef4444" }}
                />
                <div className="text-sm font-medium text-gray-900">
                  Cancelled Orders
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Count:{" "}
                <span className="font-medium">{data.cancelled_count || 0}</span>
              </div>
              {data.total_cancelled_amount !== undefined && (
                <div className="text-xs text-gray-600">
                  Lost Revenue:{" "}
                  <span className="font-medium">
                    Rs. {data.total_cancelled_amount?.toLocaleString() || "0"}
                  </span>
                </div>
              )}
              {data.cancelled_orders &&
                Object.keys(data.cancelled_orders).length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Breakdown:</div>
                    <div className="space-y-0.5">
                      {Object.entries(data.cancelled_orders)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-gray-600 truncate max-w-[60px]">
                              {key}:
                            </span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Summary Row */}
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="text-gray-600">Total Orders</div>
                <div className="font-semibold text-lg">
                  {(data.order_count || 0) - (data.cancelled_count || 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Net Revenue</div>
                <div className="font-semibold text-lg text-green-600">
                  Rs.{" "}
                  {(
                    (data.total_revenue || 0) -
                    (data.total_cancelled_amount || 0)
                  ).toLocaleString()}
                </div>
              </div>
              {(data.order_count || 0) + (data.cancelled_count || 0) > 0 && (
                <div className="text-center">
                  <div className="text-gray-600">Success Rate</div>
                  <div className="font-semibold text-lg text-green-600">
                    {(
                      ((data.order_count || 0) /
                        ((data.order_count || 0) +
                          (data.cancelled_count || 0))) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function SalesPersonRevenue({
  timeframe,
  phoneNumber,
  dateRange,
}: {
  timeframe: string;
  phoneNumber: string;
  dateRange: DateRange | undefined;
}) {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        let queryParams = `filter=${timeframe}`;
        if (dateRange?.from) {
          queryParams += `&date=${formatDateLocal(dateRange.from)}`;
        }
        if (dateRange?.to) {
          queryParams += `&end_date=${formatDateLocal(dateRange.to)}`;
        }
        const response = await api.get(
          `/api/sales/salesperson/${phoneNumber}/revenue/?${queryParams}`
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
  }, [timeframe, phoneNumber, dateRange]);

  // Transform data for the stacked chart
  const chartData = data.map((item) => ({
    name: item.period,
    orders: item.order_count,
    cancelled: item.cancelled_count,
    ...item, // Spread all fields for tooltip access
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 text-sm">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">
            No data available for the selected criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[350px] sm:h-[400px] w-full min-w-0 overflow-x-auto">
      <ResponsiveContainer width="100%" height="100%" minWidth={320}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 15,
            left: 15,
            bottom: 50,
          }}
          onMouseMove={(state) => {
            if (state && state.activeTooltipIndex !== undefined) {
              setActiveIndex(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={11}
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
                  fill="#6b7280"
                  fontSize={11}
                  transform="rotate(-35)"
                  className="transition-colors duration-200"
                >
                  {payload.value}
                </text>
              </g>
            )}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            animationDuration={150}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="rect"
            wrapperStyle={{
              paddingBottom: "20px",
            }}
          />
          <Bar
            dataKey="orders"
            stackId="stack"
            fill="#22c55e"
            name="Active Orders"
            radius={[0, 0, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-orders-${index}`}
                fill={activeIndex === index ? "#16a34a" : "#22c55e"}
                className="transition-all duration-200 hover:brightness-110"
              />
            ))}
          </Bar>
          <Bar
            dataKey="cancelled"
            stackId="stack"
            fill="#ef4444"
            name="Cancelled Orders"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-cancelled-${index}`}
                fill={activeIndex === index ? "#dc2626" : "#ef4444"}
                className="transition-all duration-200 hover:brightness-110"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

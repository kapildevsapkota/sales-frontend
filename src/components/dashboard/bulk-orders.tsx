"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { api } from "@/lib/api";
import DateRangePicker from "@/components/ui/date-range-picker";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Package, Loader2, AlertCircle, BarChart3, X } from "lucide-react";

export interface Product {
  product_name: string;
  total_quantity: number;
}

export interface DailyBreakdown {
  date: string; // ISO date string
  bulk_orders_count: number;
  products: Product[];
}

export interface BulkOrderReport {
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  total_bulk_orders: number;
  daily_breakdown: DailyBreakdown[];
}

export const BulkOrders = () => {
  const [report, setReport] = useState<BulkOrderReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const fetchBulkOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add date parameters only if date range is selected
      if (dateRange?.from && dateRange?.to) {
        params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
        params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
      }

      const response = await api.get(
        `/api/sales/bulk-orders/?${params.toString()}`
      );
      setReport(response.data);
    } catch (err) {
      console.error("Error fetching bulk orders:", err);
      setError("Failed to fetch bulk orders data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBulkOrders();
  }, []);

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    // Fetch new data when date range changes
    setTimeout(() => fetchBulkOrders(), 100);
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setError(null);
    // Fetch data without filters
    setTimeout(() => fetchBulkOrders(), 100);
  };

  // Custom tooltip component for the chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the corresponding day data for detailed product information
      const dayData = report?.daily_breakdown.find(
        (day) => format(new Date(day.date), "MMM dd") === label
      );

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 mb-2">{`Date: ${label}`}</p>
          <p className="text-orange-600 mb-2">
            {`Bulk Orders: ${payload[0].value}`}
          </p>

          {dayData && dayData.products.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Products:
              </p>
              <div className="space-y-1">
                {dayData.products.map((product, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-xs"
                  >
                    <span
                      className="text-gray-700 truncate max-w-[120px]"
                      title={product.product_name}
                    >
                      {product.product_name}
                    </span>
                    <span className="text-blue-600 font-medium ml-2">
                      {product.total_quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Prepare chart data
  const chartData =
    report?.daily_breakdown.map((day) => {
      const totalProducts = day.products.reduce(
        (sum, product) => sum + product.total_quantity,
        0
      );
      return {
        date: format(new Date(day.date), "MMM dd"),
        fullDate: format(new Date(day.date), "MMM dd, yyyy"),
        bulkOrders: day.bulk_orders_count,
        totalProducts: totalProducts,
      };
    }) || [];

  return (
    <div className="col-span-full rounded-2xl p-6 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Package className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bulk Orders Report
            </h2>
            <p className="text-sm text-gray-500">
              Analysis of bulk orders and product distribution
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
          <button
            onClick={fetchBulkOrders}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {loading ? "Loading..." : "Filter "}
          </button>
          {(dateRange?.from || dateRange?.to) && (
            <button
              onClick={clearFilters}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            <p className="text-gray-500">Loading bulk orders data...</p>
          </div>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-6">
          {/* Bar Chart */}
          {chartData.length > 0 && (
            <div className="bg-white p-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#6b7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="bulkOrders"
                      fill="#f97316"
                      name="Bulk Orders"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartData.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No bulk orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No bulk orders were found for the selected criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {!report && !loading && !error && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No bulk orders data available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No bulk orders found for the current criteria.
          </p>
        </div>
      )}
    </div>
  );
};

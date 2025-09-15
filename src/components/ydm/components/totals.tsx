"use client";
import React, { useEffect, useState } from "react";
import { Package, RefreshCw, AlertCircle } from "lucide-react";
import { OrderTrackingResponse } from "@/types/ydm-dashboard/stats";

class DashboardService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";

  static async getDashboardStats(id: number): Promise<OrderTrackingResponse> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const response = await fetch(
      `${this.baseURL}/api/logistics/franchise/${id}/order-stats/`,
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
        `HTTP ${response.status}: ${text || "Failed to fetch dashboard stats"}`
      );
    }

    return response.json();
  }
}

// Helper to prettify keys
const formatKey = (key: string) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 rounded w-64"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-100 p-6 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
    <div className="bg-gray-100 rounded-lg h-96"></div>
  </div>
);

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("delivered")) return "bg-green-100 text-green-800";
    if (
      lowerStatus.includes("out for delivery") ||
      lowerStatus.includes("order verified") ||
      lowerStatus.includes("order placed")
    )
      return "bg-blue-100 text-blue-800";
    if (lowerStatus.includes("cancelled")) return "bg-red-100 text-red-800";
    if (lowerStatus.includes("rescheduled"))
      return "bg-orange-100 text-orange-800";
    if (lowerStatus.includes("pending rtv"))
      return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex items-center justify-between">
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
          status
        )}`}
      >
        {status}
      </span>
    </div>
  );
};

export function Totals({ id }: { id: number }) {
  const [stats, setStats] = useState<OrderTrackingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await DashboardService.getDashboardStats(id);
        setStats(response);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-red-200 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats?.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm border max-w-md text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600">
            No analytics data found for this franchise.
          </p>
        </div>
      </div>
    );
  }

  let totalOrdersNos = 0;
  let totalOrdersAmount = 0;

  const categories: {
    name: string;
    rows: { status: string; nos: number; amount: number }[];
    subtotalNos: number;
    subtotalAmount: number;
  }[] = [];

  Object.entries(stats.data).forEach(([category, value]) => {
    if (category === "Total Orders") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalOrdersNos = (value as any).nos;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalOrdersAmount = (value as any).amount;
      return;
    }

    if (typeof value === "object" && !("nos" in value)) {
      let subtotalNos = 0;
      let subtotalAmount = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = Object.entries(value).map(([status, details]: any) => {
        subtotalNos += details.nos;
        subtotalAmount += details.amount;

        return {
          status: formatKey(status),
          nos: details.nos,
          amount: details.amount,
        };
      });

      categories.push({
        name: formatKey(category),
        rows,
        subtotalNos,
        subtotalAmount,
      });
    }
  });

  return (
    <>
      <div className="max-w-7xl mx-auto py-6">
        {/* Summary Table - Optional detailed view */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Breakdown
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat) => (
                  <React.Fragment key={cat.name}>
                    {cat.rows.map((row, rowIdx) => {
                      return (
                        <tr key={`${cat.name}-${rowIdx}`}>
                          {rowIdx === 0 && (
                            <td
                              className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top"
                              rowSpan={cat.rows.length + 1}
                            >
                              {cat.name}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            {row.nos.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            Rs. {row.amount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Subtotal Row */}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        Subtotal
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {cat.subtotalNos.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        Rs. {cat.subtotalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot className="bg-blue-50">
                <tr className="font-bold">
                  <td
                    className="px-6 py-4 text-sm text-gray-900 text-right"
                    colSpan={2}
                  >
                    Grand Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {totalOrdersNos.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    Rs. {totalOrdersAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

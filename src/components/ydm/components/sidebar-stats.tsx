"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  DashboardStatisticsResponse,
  PendingCODData,
} from "@/types/ydm-dashboard/data";
import Link from "next/link";

class DashboardService {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";

  static async getDashboardData(
    id: number
  ): Promise<DashboardStatisticsResponse> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    const response = await fetch(
      `${this.baseURL}/api/logistics/franchise/${id}/dashboard-stats/`,
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
        `HTTP ${response.status}: ${text || "Failed to fetch dashboard data"}`
      );
    }

    return response.json();
  }
}

export function SidebarStats({ id }: { id: number }) {
  const [dashboardData, setDashboardData] =
    useState<DashboardStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await DashboardService.getDashboardData(id);
        setDashboardData(response);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading dashboard data: {error.message}</div>;
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `Rs.${amount.toLocaleString()}`;
  };

  const data = dashboardData?.data;
  const pendingCOD = data?.overall_statistics?.["Total Pending COD"] as
    | PendingCODData
    | undefined;

  return (
    <div className="space-y-4">
      {/* Order Summary */}
      <Card className="shadow-none border border-gray-100 rounded-xl">
        <CardContent className="p-4 space-y-2.5">
          <div className="text-sm space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Total Orders:</span>
              <span className="font-semibold">
                {data?.overall_statistics?.["Total Orders"]?.nos || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Total COD:</span>
              <span className="font-semibold">
                {formatCurrency(
                  data?.overall_statistics?.["Total Orders"]?.amount || 0
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Total RTV:</span>
              <span className="font-semibold">
                {data?.overall_statistics?.["Total RTV"]?.nos || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">
                Total Delivered:
              </span>
              <span className="font-semibold">
                {data?.overall_statistics?.["Total Delivered"]?.nos || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">
                Total Delivery Charge:
              </span>
              <span className="font-semibold">
                {formatCurrency(
                  data?.overall_statistics?.["Total Delivery Charge"]?.amount ||
                    0
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">
                Total Pending COD:
              </span>
              <span className={"font-semibold"}>
                {formatCurrency(pendingCOD?.amount || 0)}
                {pendingCOD?.has_invoices && (
                  <Link href="/admin/ydm/invoice">
                    <span className="ml-2 text-xs font-medium text-red-600">
                      ({pendingCOD?.number_of_invoices}{" "}
                      {pendingCOD?.number_of_invoices === 1
                        ? "invoice"
                        : "invoices"}
                      )
                    </span>
                  </Link>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Stats */}
      <Card className="shadow-none border border-gray-100 rounded-xl">
        <CardContent className="p-4 space-y-2.5">
          <div className="text-sm space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Todays Orders:</span>
              <span className="font-semibold">
                {data?.todays_statistics?.["Todays Orders"] || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">
                Todays Delivery:
              </span>
              <span className="font-semibold">
                {data?.todays_statistics?.["Todays Delivery"] || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">
                Todays Rescheduled:
              </span>
              <span className="font-semibold">
                {data?.todays_statistics?.["Todays Rescheduled"] || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">
                Todays Cancellation:
              </span>
              <span className="font-semibold">
                {data?.todays_statistics?.["Todays Cancellation"] || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Open Tickets:</span>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Performance */}
      <Card className="shadow-none border border-gray-100 rounded-xl">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-semibold text-slate-800">
            Delivery Performance %
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <div className="flex justify-between items-center text-sm py-1">
            <span className="font-medium text-slate-700">Delivered:</span>
            <span className="font-semibold text-emerald-600">
              {data?.delivery_performance?.["Delivered Percentage"]?.toFixed(
                2
              ) || 0.0}{" "}
              %
            </span>
          </div>
          <div className="flex justify-between items-center text-sm py-1">
            <span className="font-medium text-slate-700">Cancelled:</span>
            <span className="font-semibold text-red-500">
              {data?.delivery_performance?.["Cancelled Percentage"]?.toFixed(
                2
              ) || 0.0}{" "}
              %
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

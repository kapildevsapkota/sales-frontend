"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderTrackingResponse } from "@/types/ydm-dashboard/stats";
import { useState, useEffect } from "react";

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

export function StatusCards({ id }: { id: number }) {
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading stats: {error.message}</div>;
  }

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Order Processing Card */}
      <Card className="bg-amber-500 text-white shadow-sm border-0 rounded-xl">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-center text-white font-semibold text-sm">
            ORDER PROCESSING
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium opacity-90">
            <div>STATUS</div>
            <div>NOS</div>
            <div>AMOUNT</div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs">Order Placed</div>
              <div>
                {stats?.data?.order_processing?.["Order Placed"]?.nos || 0}
              </div>
              <div>
                {formatAmount(
                  stats?.data?.order_processing?.["Order Placed"]?.amount || 0
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs">Order Verified</div>
              <div>
                {stats?.data?.order_processing?.["Order Verified"]?.nos || 0}
              </div>
              <div>
                {formatAmount(
                  stats?.data?.order_processing?.["Order Verified"]?.amount || 0
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Dispatched Card */}
      <Card className="bg-amber-500 text-white shadow-sm border-0 rounded-xl">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-center text-white font-semibold text-sm">
            ORDER DISPATCHED
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium opacity-90">
            <div>STATUS</div>
            <div>NOS</div>
            <div>AMOUNT</div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs">Out For Delivery</div>
              <div>
                {stats?.data?.order_dispatched?.["Out For Delivery"]?.nos || 0}
              </div>
              <div>
                {formatAmount(
                  stats?.data?.order_dispatched?.["Out For Delivery"]?.amount ||
                    0
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs">Rescheduled</div>
              <div>
                {stats?.data?.order_dispatched?.["Rescheduled"]?.nos || 0}
              </div>
              <div>
                {formatAmount(
                  stats?.data?.order_dispatched?.["Rescheduled"]?.amount || 0
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Card */}
      <Card className="bg-amber-500 text-white shadow-sm border-0 rounded-xl">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-center text-white font-semibold text-sm">
            ORDER STATUS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium opacity-90">
            <div>STATUS</div>
            <div>NOS</div>
            <div>AMOUNT</div>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs">Delivered</div>
              <div>{stats?.data?.order_status?.["Delivered"]?.nos || 0}</div>
              <div>
                {formatAmount(
                  stats?.data?.order_status?.["Delivered"]?.amount || 0
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs">Cancelled</div>
              <div>{stats?.data?.order_status?.["Cancelled"]?.nos || 0}</div>
              <div>
                {formatAmount(
                  stats?.data?.order_status?.["Cancelled"]?.amount || 0
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-xs">Pending RTV</div>
              <div>{stats?.data?.order_status?.["Pending RTV"]?.nos || 0}</div>
              <div>
                {formatAmount(
                  stats?.data?.order_status?.["Pending RTV"]?.amount || 0
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

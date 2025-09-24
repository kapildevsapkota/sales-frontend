"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Clock, Package } from "lucide-react";
import { OrderFilters } from "../ydm-orders/order-filters";
import { OrdersTable } from "../ydm-orders/orders-table";
import { YDMApiService } from "@/lib/ydm-api";
import {
  SaleItem,
  YDMRiderOrderFilters,
} from "@/types/ydm-dashboard/ydm-orders";
import { useState, useEffect, useCallback } from "react";

export default function ReturnPendingView({ id }: { id: number }) {
  // State management
  const [orders, setOrders] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter states
  const [searchOrder, setSearchOrder] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filterDeliveryType, setFilterDeliveryType] = useState("all");
  const [filterIsAssigned, setFilterIsAssigned] = useState("all");

  // Fetch orders function
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      const filters: YDMRiderOrderFilters = {
        page: currentPage,
        pageSize: pageSize,
        search: searchOrder || undefined,
        orderStatus: "Return Pending",
        deliveryType:
          filterDeliveryType !== "all" ? filterDeliveryType : undefined,
        isAssigned: filterIsAssigned !== "all" ? filterIsAssigned : undefined,
        startDate: dateRange.from || undefined,
        endDate: dateRange.to || undefined,
      };

      const response = await YDMApiService.get(id, filters);

      setOrders(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / pageSize));
    } catch (err) {
      setIsError(true);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch orders")
      );
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    id,
    currentPage,
    pageSize,
    searchOrder,
    filterStatus,
    dateRange,
    filterDeliveryType,
    filterIsAssigned,
  ]);

  // Fetch orders on component mount and when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchOrder,
    filterStatus,
    dateRange,
    filterDeliveryType,
    filterIsAssigned,
  ]);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent to ydm":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "verified":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        // Show cancelled in red colors
        return "bg-red-100 text-red-800 border-red-200";
      case "returned by customer":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "return pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "returned by ydm":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "out for delivery":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "rescheduled":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const hasActiveFilters = () => {
    return (
      searchOrder !== "" ||
      filterStatus !== "all" ||
      dateRange.from !== "" ||
      dateRange.to !== "" ||
      filterDeliveryType !== "all" ||
      filterIsAssigned !== "all"
    );
  };

  const clearAllFilters = () => {
    setSearchOrder("");
    setFilterStatus("all");
    setDateRange({ from: "", to: "" });
    setFilterDeliveryType("all");
    setFilterIsAssigned("all");
    setCurrentPage(1);
  };

  if (isError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading orders</div>
          <div className="text-sm text-gray-600">{error?.message}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Order Assignment Center
                </CardTitle>
              </div>
              <OrderFilters
                searchOrder={searchOrder}
                setSearchOrder={setSearchOrder}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                dateRange={dateRange}
                setDateRange={setDateRange}
                filterDeliveryType={filterDeliveryType}
                setFilterDeliveryType={setFilterDeliveryType}
                hasActiveFilters={hasActiveFilters}
                clearAllFilters={clearAllFilters}
                filterIsAssigned={filterIsAssigned}
                setFilterIsAssigned={setFilterIsAssigned}
                onlySearch
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-600">
              Showing {orders.length} of {totalCount} orders
              {(dateRange.from || dateRange.to) && (
                <span>
                  {" • Date: "}
                  {dateRange.from && dateRange.to
                    ? `${dateRange.from} to ${dateRange.to}`
                    : dateRange.from
                    ? `from ${dateRange.from}`
                    : `until ${dateRange.to}`}
                </span>
              )}
              {filterDeliveryType !== "all" && ` • ${filterDeliveryType}`}
              {filterStatus !== "all" && ` • Status: ${filterStatus}`}
              {filterIsAssigned !== "all" && ` • Assigned: ${filterIsAssigned}`}
            </div>

            {isLoading ? (
              <div className="p-6 flex items-center justify-center min-h-[200px]">
                <Clock className="w-5 h-5 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-600">Loading orders...</span>
              </div>
            ) : (
              <OrdersTable
                orders={orders}
                currentPage={currentPage}
                pageSize={pageSize}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            )}

            {totalPages > 1 && !isLoading && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalCount} total orders)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { OfflineOrder, OfflineOrdersResponse } from "@/types/offline-sales";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  RefreshCw,
  Eye,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Phone,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function OfflineOrdersTable() {
  const router = useRouter();
  const [orders, setOrders] = useState<OfflineOrder[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (pageToFetch = 1) => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const params: Record<string, string | number> = {
          page: pageToFetch,
          page_size: pageSize,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        // Call the endpoint requested by user: /api/offline-sales/orders
        let response;
        try {
          response = await api.get<OfflineOrdersResponse>(
            "/api/offline-sales/orders",
            { params }
          );
        } catch (err: unknown) {
          // Fallback with trailing slash in case backend requires it
          if (
            isAxiosError(err) &&
            (err.response?.status === 404 || err.response?.status === 301)
          ) {
            response = await api.get<OfflineOrdersResponse>(
              "/api/offline-sales/orders/",
              { params }
            );
          } else {
            throw err;
          }
        }

        const data = response.data;
        const results = Array.isArray(data) ? data : data?.results || [];
        const count =
          typeof data?.count === "number" ? data.count : results.length;

        setOrders(results);
        setTotalCount(count);
        setCurrentPage(pageToFetch);
      } catch (err: unknown) {
        console.error("Failed to load offline orders:", err);
        let errorMsg = "Failed to load offline orders.";
        if (isAxiosError<{ detail?: string; message?: string }>(err)) {
          errorMsg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            errorMsg;
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        setError(errorMsg);
        toast.error("Failed to fetch offline orders");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, debouncedSearch]
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  // Derived KPI Stats
  const totalRevenue = orders.reduce(
    (acc, order) => acc + (parseFloat(order.total_amount) || 0),
    0
  );
  const totalPaid = orders.reduce(
    (acc, order) => acc + (parseFloat(order.paid_amount) || 0),
    0
  );
  const totalRemaining = orders.reduce(
    (acc, order) => acc + (parseFloat(order.remaining_amount) || 0),
    0
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Orders
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Processed offline orders
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Value
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Rs. {totalRevenue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current page gross value
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Collected (Paid)
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Rs. {totalPaid.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600/70 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Received payments
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Remaining Due
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                Rs. {totalRemaining.toLocaleString()}
              </h3>
              <p className="text-[11px] text-amber-600/70 mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pending collection
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Container Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-6 space-y-5">
        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by order code, customer, phone, salesperson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 h-10 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Page Size Select */}
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[110px] h-10 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-xs sm:text-sm">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchOrders(currentPage)}
              disabled={isLoading}
              className="h-10 w-10 rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
              title="Refresh Orders"
            >
              <RefreshCw
                className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-300 text-rose-700 hover:bg-rose-100"
              onClick={() => fetchOrders(currentPage)}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Data Table */}
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-neutral-800/80 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Order Code</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Franchise</th>
                  <th className="py-3.5 px-4">Salesperson</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Remaining</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-neutral-800 rounded ml-auto"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-neutral-800 rounded ml-auto"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-neutral-800 rounded ml-auto"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-7 w-7 bg-slate-200 dark:bg-neutral-800 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          No offline orders found
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {searchTerm
                            ? "Try adjusting your search query."
                            : "New offline sales orders submitted by agents will appear here."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/offline-sales/orders/${order.order_code}`)
                      }
                    >
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/offline-sales/orders/${order.order_code}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-purple-700 dark:text-purple-400 hover:underline"
                        >
                          {order.order_code}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {order.order_date}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {order.customer_name}
                        </div>
                        {order.customer_contact_person && (
                          <div className="text-[11px] text-slate-500">
                            {order.customer_contact_person}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />
                          <span>{order.customer_phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {order.franchise_name}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span className="font-medium">
                          {order.sales_person_name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {order.items && order.items.length > 0 ? (
                          <div className="flex flex-col gap-1 min-w-[160px] max-w-xs">
                            {order.items.map((item) => (
                              <div
                                key={item.id || `${item.product_id}-${item.quantity}`}
                                className="inline-flex items-center gap-1.5 text-xs"
                              >
                                <span className="text-slate-800 dark:text-slate-200 font-medium">
                                  {item.product_name}
                                </span>
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50 shrink-0">
                                  ×{item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {order.items_count ? `${order.items_count} items` : "No items"}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Rs. {parseFloat(order.paid_amount || "0").toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        Rs.{" "}
                        {parseFloat(order.remaining_amount || "0").toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        Rs. {parseFloat(order.total_amount || "0").toLocaleString()}
                      </td>

                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/offline-sales/orders/${order.order_code}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg"
                            title="View order details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalCount}
            </span>{" "}
            orders
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => fetchOrders(1)}
              disabled={currentPage <= 1 || isLoading}
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Prev Page */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-lg px-2.5"
              onClick={() => fetchOrders(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </Button>

            <span className="px-3 py-1 font-medium rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-lg px-2.5"
              onClick={() => fetchOrders(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => fetchOrders(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

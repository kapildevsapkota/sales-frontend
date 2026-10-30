"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { OfflineCustomer, OfflineCustomersResponse } from "@/types/offline-sales";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Phone,
  RefreshCw,
  Eye,
  Store,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShoppingBag,
  CreditCard,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export function OfflineCustomersView() {
  const router = useRouter();
  const [customers, setCustomers] = useState<OfflineCustomer[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(
    async (pageToFetch = 1) => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const params: Record<string, string | number | boolean> = {
          page: pageToFetch,
          page_size: pageSize,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (statusFilter === "active") {
          params.is_active = true;
        } else if (statusFilter === "inactive") {
          params.is_active = false;
        }

        // Call the endpoint requested: /api/offline-sales/customers/
        let response;
        try {
          response = await api.get<OfflineCustomersResponse>(
            "/api/offline-sales/customers/",
            { params }
          );
        } catch (err: unknown) {
          if (
            isAxiosError(err) &&
            (err.response?.status === 404 || err.response?.status === 301)
          ) {
            response = await api.get<OfflineCustomersResponse>(
              "/api/offline-sales/customers",
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

        setCustomers(results);
        setTotalCount(count);
        setCurrentPage(pageToFetch);
      } catch (err: unknown) {
        console.error("Failed to fetch offline customers:", err);
        let errorMsg = "Failed to load offline customers.";
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
        toast.error("Failed to fetch customers");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, debouncedSearch, statusFilter]
  );

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  // Derived KPI Stats from current list
  const totalPurchased = customers.reduce(
    (sum, c) => sum + (c.total_purchased_amount || 0),
    0
  );
  const totalPaid = customers.reduce(
    (sum, c) => sum + (c.total_paid_amount || 0),
    0
  );
  const totalRemaining = customers.reduce(
    (sum, c) => sum + (c.total_remaining_amount || 0),
    0
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleOpenDetails = (cust: OfflineCustomer) => {
    router.push(`/offline-sales/customers/${cust.id}`);
  };

  return (
    <div className="space-y-6">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Clients
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Registered retail & field stores
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Volume
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Rs. {totalPurchased.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current page purchases
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
                <CheckCircle2 className="h-3 w-3" /> Cleared payments
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Outstanding Balance
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                Rs. {totalRemaining.toLocaleString()}
              </h3>
              <p className="text-[11px] text-amber-600/70 mt-0.5">
                Pending collection
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Customers List Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by store name, contact, phone, salesperson..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 h-10 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Select */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-10 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-xs sm:text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

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
              onClick={() => fetchCustomers(currentPage)}
              disabled={isLoading}
              className="h-10 w-10 rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
              title="Refresh Customers"
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
              onClick={() => fetchCustomers(currentPage)}
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
                  <th className="py-3.5 px-4">Store / Client</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Franchise</th>
                  <th className="py-3.5 px-4">Salesperson</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Purchased</th>
                  <th className="py-3.5 px-4 text-right">Total Paid</th>
                  <th className="py-3.5 px-4 text-right">Remaining Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-12 bg-slate-200 dark:bg-neutral-800 rounded mx-auto"></div>
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
                        <div className="h-5 w-14 bg-slate-200 dark:bg-neutral-800 rounded-full mx-auto"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-7 w-7 bg-slate-200 dark:bg-neutral-800 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400">
                          <Store className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          No offline customers found
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search query or status filter."
                            : "New customers added by field sales agents will appear here."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetails(cust)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {cust.store_name}
                        </div>
                        {cust.address && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {cust.address}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                        {cust.contact_person}
                      </td>

                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        <a
                          href={`tel:${cust.phone_number}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-purple-600 hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{cust.phone_number}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {cust.franchise_name}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {cust.sales_person_name}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300">
                          <ShoppingBag className="h-3 w-3 text-slate-400" />
                          {cust.total_orders_count}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        Rs. {(cust.total_purchased_amount || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Rs. {(cust.total_paid_amount || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold whitespace-nowrap">
                        {(cust.total_remaining_amount || 0) > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            Rs.{" "}
                            {(
                              cust.total_remaining_amount || 0
                            ).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Rs. 0
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          className={
                            cust.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-medium"
                          }
                        >
                          {cust.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>

                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/offline-sales/customers/${cust.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg"
                            title="View customer details"
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
            clients
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => fetchCustomers(1)}
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
              onClick={() => fetchCustomers(currentPage - 1)}
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
              onClick={() => fetchCustomers(currentPage + 1)}
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
              onClick={() => fetchCustomers(totalPages)}
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

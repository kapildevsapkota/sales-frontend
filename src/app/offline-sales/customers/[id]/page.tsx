"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { OfflineCustomer, OfflineOrder, OfflineOrdersResponse } from "@/types/offline-sales";
import { OfflineSalesNav } from "@/components/offline-sales/offline-sales-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Phone,
  MapPin,
  User,
  ShoppingBag,
  DollarSign,
  CreditCard,
  Clock,
  RefreshCw,
  AlertCircle,
  Package,
  CheckCircle2,
  Eye,
  UserCheck,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<OfflineCustomer | null>(null);
  const [orders, setOrders] = useState<OfflineOrder[]>([]);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    try {
      setIsLoadingCustomer(true);
      setCustomerError(null);
      const res = await api.get<OfflineCustomer>(
        `/api/offline-sales/customers/${customerId}/`
      );
      setCustomer(res.data);
    } catch (err: unknown) {
      let msg = "Failed to load customer details.";
      if (isAxiosError<{ detail?: string }>(err)) {
        msg = err.response?.data?.detail || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setCustomerError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingCustomer(false);
    }
  }, [customerId]);

  const fetchOrders = useCallback(async () => {
    if (!customerId) return;
    try {
      setIsLoadingOrders(true);
      setOrdersError(null);
      const res = await api.get<OfflineOrdersResponse>(
        `/api/offline-sales/orders/`,
        { params: { customer: customerId, page_size: 100 } }
      );
      const data = res.data;
      setOrders(Array.isArray(data) ? data : data?.results || []);
    } catch (err: unknown) {
      let msg = "Failed to load customer orders.";
      if (isAxiosError<{ detail?: string }>(err)) {
        msg = err.response?.data?.detail || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setOrdersError(msg);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
    fetchOrders();
  }, [fetchCustomer, fetchOrders]);

  const handleRefresh = () => {
    fetchCustomer();
    fetchOrders();
  };

  const getPaymentBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "paid")
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium text-[11px]">
          Paid
        </Badge>
      );
    if (s === "partial")
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 font-medium text-[11px]">
          Partial
        </Badge>
      );
    return (
      <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-medium text-[11px]">
        Unpaid
      </Badge>
    );
  };

  const totalPurchased = customer?.total_purchased_amount || 0;
  const totalPaid = customer?.total_paid_amount || 0;
  const totalRemaining = customer?.total_remaining_amount || 0;
  const totalOrders = customer?.total_orders_count || orders.length;

  const isLoading = isLoadingCustomer || isLoadingOrders;

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6">
      <OfflineSalesNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/offline-sales/customers")}
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-neutral-700 shrink-0"
            title="Back to Customers"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {customer?.store_name || "Customer Details"}
              </h1>
              {customer && (
                <Badge
                  className={
                    customer.is_active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                      : "bg-rose-50 text-rose-700 border-rose-200 font-semibold"
                  }
                >
                  {customer.is_active ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
            {customer?.address && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin className="h-3 w-3" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-xl h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/offline-sales/customers">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs">
              All Customers
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading */}
      {isLoadingCustomer && !customer ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
          <span className="text-sm text-slate-500 font-medium">Loading customer...</span>
        </div>
      ) : customerError ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6 text-rose-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{customerError}</h3>
          <Button size="sm" variant="outline" onClick={fetchCustomer} className="rounded-xl">
            Retry
          </Button>
        </div>
      ) : customer ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalOrders}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">All time orders</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Purchased</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    Rs. {totalPurchased.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Gross order value</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 shrink-0">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Paid</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Rs. {totalPaid.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-emerald-600/70 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Collected
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
                  <CreditCard className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Due</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    Rs. {totalRemaining.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-amber-600/70 mt-0.5">
                    {totalRemaining === 0 ? "Fully settled" : "Pending collection"}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-Col Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Orders List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  Order History
                  <span className="text-xs font-normal text-slate-400">({orders.length})</span>
                </h2>
              </div>

              {isLoadingOrders ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 h-24"
                    />
                  ))}
                </div>
              ) : ordersError ? (
                <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{ordersError}</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No orders yet</p>
                  <p className="text-xs text-slate-400 mt-1">This customer has no recorded orders.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const orderTotal = parseFloat(order.total_amount || "0");
                    const orderPaid = parseFloat(order.paid_amount || "0");
                    const orderRemaining = parseFloat(order.remaining_amount || "0");

                    return (
                      <div
                        key={order.id}
                        className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden hover:border-purple-200 dark:hover:border-purple-800/50 transition-colors"
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Link
                              href={`/offline-sales/orders/${order.order_code}`}
                              className="font-bold text-purple-700 dark:text-purple-400 hover:underline text-sm shrink-0"
                            >
                              {order.order_code}
                            </Link>
                            {getPaymentBadge(order.payment_status)}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {order.order_date}
                            </span>
                            <Link href={`/offline-sales/orders/${order.order_code}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* Order Body */}
                        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Items */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Items</p>
                            <div className="flex flex-wrap gap-1.5">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 rounded-lg px-2.5 py-1"
                                  >
                                    <Package className="h-3 w-3 text-slate-400 shrink-0" />
                                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                      {item.product_name}
                                    </span>
                                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                                      ×{item.quantity}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">No items</span>
                              )}
                            </div>
                            {order.remarks ? (
                              <p className="text-[11px] text-slate-400 italic mt-2">
                                &ldquo;{order.remarks}&rdquo;
                              </p>
                            ) : null}
                          </div>

                          {/* Amounts */}
                          <div className="flex sm:flex-col gap-4 sm:gap-2 sm:text-right shrink-0 sm:min-w-[120px]">
                            <div>
                              <p className="text-[11px] text-slate-400">Total</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Rs. {orderTotal.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400">Paid</p>
                              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                Rs. {orderPaid.toLocaleString()}
                              </p>
                            </div>
                            {orderRemaining > 0 && (
                              <div>
                                <p className="text-[11px] text-slate-400">Due</p>
                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                  Rs. {orderRemaining.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Customer Info Sidebar */}
            <div className="space-y-5">
              {/* Contact Info */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-purple-600" /> Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-[11px] text-slate-400 mb-0.5">Contact Person</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {customer.contact_person}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-neutral-800">
                    <p className="text-[11px] text-slate-400 mb-0.5">Phone</p>
                    <a
                      href={`tel:${customer.phone_number}`}
                      className="text-sm font-semibold text-purple-600 hover:underline flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {customer.phone_number}
                    </a>
                  </div>
                  {customer.address && (
                    <div className="pt-3 border-t border-slate-100 dark:border-neutral-800">
                      <p className="text-[11px] text-slate-400 mb-0.5">Address</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                        {customer.address}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assigned Agent */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-indigo-600" /> Assigned Agent
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {customer.sales_person_name}
                  </p>
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardContent className="p-4 space-y-2.5 text-xs text-slate-500">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="h-3 w-3" /> Customer Since
                    </span>
                    <strong className="text-slate-700 dark:text-slate-300 text-right">
                      {format(new Date(customer.created_at), "MMM dd, yyyy")}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {format(new Date(customer.created_at), "hh:mm a")}
                      </span>
                    </strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-neutral-800 pt-2.5">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3 w-3" /> Last Updated
                    </span>
                    <strong className="text-slate-700 dark:text-slate-300 text-right">
                      {format(new Date(customer.updated_at), "MMM dd, yyyy")}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {format(new Date(customer.updated_at), "hh:mm a")}
                      </span>
                    </strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


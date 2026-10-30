"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { OfflineOrder } from "@/types/offline-sales";
import { OfflineSalesNav } from "@/components/offline-sales/offline-sales-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Copy,
  Check,
  Package,
  Calendar,
  User,
  Phone,
  Building,
  UserCheck,
  CreditCard,
  DollarSign,
  Receipt,
  FileText,
  Clock,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export default function OfflineOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || "";

  const [order, setOrder] = useState<OfflineOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Lightbox for payment screenshot
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(
    null
  );

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Call the requested endpoint: /api/offline-sales/orders/{id}
      let response;
      try {
        response = await api.get<OfflineOrder>(
          `/api/offline-sales/orders/${encodeURIComponent(orderId)}/`
        );
      } catch (err: unknown) {
        if (
          isAxiosError(err) &&
          (err.response?.status === 404 || err.response?.status === 301)
        ) {
          response = await api.get<OfflineOrder>(
            `/api/offline-sales/orders/${encodeURIComponent(orderId)}`
          );
        } else {
          throw err;
        }
      }

      setOrder(response.data);
    } catch (err: unknown) {
      console.error("Failed to load order detail:", err);
      let msg = "Failed to load order details.";
      if (isAxiosError<{ detail?: string; message?: string }>(err)) {
        msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const handleCopyCode = () => {
    if (!order?.order_code) return;
    navigator.clipboard.writeText(order.order_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getOrderStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered")) {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold px-2.5 py-1">
          Delivered
        </Badge>
      );
    }
    if (s.includes("pending") || s.includes("process")) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 font-semibold px-2.5 py-1">
          {status}
        </Badge>
      );
    }
    if (s.includes("cancel")) {
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-semibold px-2.5 py-1">
          Cancelled
        </Badge>
      );
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "paid") {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 font-semibold px-2.5 py-1">
          Paid
        </Badge>
      );
    }
    if (s === "partial") {
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 font-semibold px-2.5 py-1">
          Partial Payment
        </Badge>
      );
    }
    if (s === "unpaid" || s === "due") {
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-semibold px-2.5 py-1">
          Unpaid
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const total = parseFloat(order?.total_amount || "0") || 0;
  const paid = parseFloat(order?.paid_amount || "0") || 0;
  const remaining = parseFloat(order?.remaining_amount || "0") || 0;
  const paidPercent =
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6">
      <OfflineSalesNav />

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/offline-sales/orders")}
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-neutral-700"
            title="Back to Orders"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {order?.order_code || orderId}
              </h1>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                title="Copy order code"
              >
                {copiedCode ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              {order && (
                <div className="flex items-center gap-2">
                  {getOrderStatusBadge(order.order_status)}
                  {getPaymentStatusBadge(order.payment_status)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Order Date: {order?.order_date || "—"}
              </span>
              <span>•</span>
              <span>Order ID: #{order?.id || "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrderDetail}
            disabled={isLoading}
            className="rounded-xl h-9 text-xs gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Link href="/offline-sales/orders">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs">
              All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
          <span className="text-sm text-slate-500 font-medium">
            Loading order {orderId}...
          </span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {error}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to retrieve the order. Please ensure the order code or ID is correct.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchOrderDetail}
            className="rounded-xl"
          >
            Retry
          </Button>
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Amount
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    Rs. {total.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Order gross amount
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Paid Amount
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    Rs. {paid.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-emerald-600/70 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {paidPercent}% collected
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <CreditCard className="h-5 w-5" />
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
                    Rs. {remaining.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-amber-600/70 mt-0.5">
                    {remaining === 0 ? "Fully Settled" : "Pending collection"}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Items
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {order.items_count || order.items?.length || 0}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Products ordered
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                  <Package className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-Column Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Products & Payment History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ordered Products Table Card */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      Ordered Products ({order.items?.length || 0})
                    </CardTitle>
                    <span className="text-xs text-slate-400">
                      Total quantity:{" "}
                      {order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/80 dark:bg-neutral-800/80 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 dark:border-neutral-800">
                        <tr>
                          <th className="py-3 px-4">Product Details</th>
                          <th className="py-3 px-4 text-center">Product ID</th>
                          <th className="py-3 px-4 text-center">Inventory ID</th>
                          <th className="py-3 px-4 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/40">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {item.product_image ? (
                                      <Image
                                        src={item.product_image}
                                        alt={item.product_name}
                                        width={44}
                                        height={44}
                                        unoptimized
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Package className="h-5 w-5 text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">
                                      {item.product_name}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      Item #{item.id}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-center text-xs text-slate-600 dark:text-slate-300">
                                #{item.product_id}
                              </td>

                              <td className="py-3.5 px-4 text-center text-xs text-slate-600 dark:text-slate-300">
                                #{item.inventory}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                                  {item.quantity} pcs
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                              No products recorded in this order.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History Card */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-emerald-600" />
                      Payment History ({order.payment_history?.length || 0})
                    </CardTitle>
                    <span className="text-xs text-emerald-600 font-semibold">
                      Total Paid: Rs. {paid.toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {order.payment_history && order.payment_history.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 dark:bg-neutral-800/80 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 dark:border-neutral-800">
                          <tr>
                            <th className="py-3 px-4">Date & Time</th>
                            <th className="py-3 px-4">Method</th>
                            <th className="py-3 px-4 text-right">Amount</th>
                            <th className="py-3 px-4">Recorded By</th>
                            <th className="py-3 px-4 text-center">Receipt</th>
                            <th className="py-3 px-4">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                          {order.payment_history.map((pay) => (
                            <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/40">
                              <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {format(new Date(pay.payment_date), "MMM dd, yyyy")}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {format(new Date(pay.payment_date), "hh:mm a")}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                                <Badge variant="secondary" className="font-medium text-[11px]">
                                  {pay.payment_method_display || pay.payment_method}
                                </Badge>
                              </td>

                              <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                Rs. {parseFloat(pay.amount || "0").toLocaleString()}
                              </td>

                              <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {pay.recorded_by_name}
                              </td>

                              {/* Screenshot Receipt */}
                              <td className="py-3.5 px-4 text-center">
                                {pay.payment_screenshot ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedScreenshot(pay.payment_screenshot)
                                    }
                                    className="group relative h-9 w-9 rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-700 inline-flex items-center justify-center hover:ring-2 hover:ring-purple-600 transition-all"
                                    title="View payment receipt"
                                  >
                                    <Image
                                      src={pay.payment_screenshot}
                                      alt="Payment receipt"
                                      width={36}
                                      height={36}
                                      unoptimized
                                      className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                      <Eye className="h-3.5 w-3.5" />
                                    </div>
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-xs">—</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-xs text-slate-500 italic max-w-xs truncate">
                                {pay.remarks || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No payment transactions recorded for this order yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (1 Col): Customer, Franchise, Timestamps */}
            <div className="space-y-6">
              {/* Customer Information Card */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-purple-600" /> Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-slate-400">Store / Customer</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white">
                      {order.customer_name}
                    </div>
                    <div className="text-xs text-slate-400">
                      Client ID: #{order.customer}
                    </div>
                  </div>

                  {order.customer_contact_person && (
                    <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                      <div className="text-xs text-slate-400">Contact Person</div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {order.customer_contact_person}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                    <div className="text-xs text-slate-400">Phone Number</div>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{order.customer_phone}</span>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Franchise & Sales Person Card */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-indigo-600" /> Franchise & Agent
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-slate-400">Assigned Franchise</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {order.franchise_name}
                    </div>
                    <div className="text-xs text-slate-400">
                      Franchise ID: #{order.franchise}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                    <div className="text-xs text-slate-400">Field Salesperson</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      <span>{order.sales_person_name}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Agent ID: #{order.sales_person}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Remarks Card */}
              {order.remarks && (
                <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                  <CardHeader className="pb-2 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-slate-400" /> Order Remarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                      &ldquo;{order.remarks}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Timestamps Card */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardContent className="p-4 space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <strong className="text-slate-700 dark:text-slate-300">
                      {format(new Date(order.created_at), "MMM dd, yyyy • hh:mm a")}
                    </strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-neutral-800 pt-2">
                    <span>Last Updated:</span>
                    <strong className="text-slate-700 dark:text-slate-300">
                      {format(new Date(order.updated_at), "MMM dd, yyyy • hh:mm a")}
                    </strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      {/* Payment Receipt Lightbox Modal */}
      <Dialog
        open={Boolean(selectedScreenshot)}
        onOpenChange={(open) => !open && setSelectedScreenshot(null)}
      >
        <DialogContent className="max-w-xl p-4">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-sm font-bold flex items-center justify-between">
              <span>Payment Receipt Screenshot</span>
              {selectedScreenshot && (
                <a
                  href={selectedScreenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-normal"
                >
                  <span>Open Full Image</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[65vh] rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-900 flex items-center justify-center">
            {selectedScreenshot && (
              <Image
                src={selectedScreenshot}
                alt="Payment proof screenshot"
                fill
                unoptimized
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


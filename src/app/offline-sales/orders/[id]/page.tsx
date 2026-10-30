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
    if (s.includes("delivered"))
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold px-2.5 py-1">
          Delivered
        </Badge>
      );
    if (s.includes("pending") || s.includes("process"))
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 font-semibold px-2.5 py-1">
          {status}
        </Badge>
      );
    if (s.includes("cancel"))
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-semibold px-2.5 py-1">
          Cancelled
        </Badge>
      );
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "paid")
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 font-semibold px-2.5 py-1">
          Paid
        </Badge>
      );
    if (s === "partial")
      return (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 font-semibold px-2.5 py-1">
          Partial Payment
        </Badge>
      );
    if (s === "unpaid" || s === "due")
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 font-semibold px-2.5 py-1">
          Unpaid
        </Badge>
      );
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/offline-sales/orders")}
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-neutral-700 shrink-0"
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
              <Calendar className="h-3 w-3" />
              <span>Order Date: {order?.order_date || "—"}</span>
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
            Unable to retrieve the order. Please ensure the order code is correct.
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
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
                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
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
                <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0">
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
                <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Package className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Products, Payment History, Remarks */}
            <div className="lg:col-span-2 space-y-6">

              {/* Ordered Products */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      Ordered Products ({order.items?.length || 0})
                    </CardTitle>
                    <span className="text-xs text-slate-400">
                      Total qty:{" "}
                      {order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {order.items && order.items.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
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
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                {item.product_name}
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 shrink-0">
                            {item.quantity} pcs
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No products recorded in this order.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment History */}
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
                    <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                      {order.payment_history.map((pay) => (
                        <div
                          key={pay.id}
                          className="px-4 py-4 hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Left: date + method + recorded by */}
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {format(new Date(pay.payment_date), "MMM dd, yyyy")}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {format(new Date(pay.payment_date), "hh:mm a")}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="font-medium text-[11px]"
                                >
                                  {pay.payment_method_display || pay.payment_method}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <UserCheck className="h-3 w-3" />
                                <span>Recorded by {pay.recorded_by_name}</span>
                              </div>
                              {pay.remarks && (
                                <p className="text-[11px] text-slate-500 italic mt-1">
                                  &ldquo;{pay.remarks}&rdquo;
                                </p>
                              )}
                            </div>

                            {/* Right: amount + screenshot */}
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                Rs. {parseFloat(pay.amount || "0").toLocaleString()}
                              </span>
                              {pay.payment_screenshot ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedScreenshot(pay.payment_screenshot)
                                  }
                                  className="group relative h-10 w-10 rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-700 inline-flex items-center justify-center hover:ring-2 hover:ring-purple-600 transition-all shrink-0"
                                  title="View payment receipt"
                                >
                                  <Image
                                    src={pay.payment_screenshot}
                                    alt="Payment receipt"
                                    width={40}
                                    height={40}
                                    unoptimized
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                    <Eye className="h-3.5 w-3.5" />
                                  </div>
                                </button>
                              ) : (
                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                  <Receipt className="h-4 w-4 text-slate-300" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No payment transactions recorded for this order yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Remarks — below payment history */}
              {order.remarks && (
                <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                  <CardHeader className="pb-2 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-slate-400" /> Order Remarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-neutral-800/50 p-3 rounded-xl leading-relaxed">
                      &ldquo;{order.remarks}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Customer, Salesperson, Timestamps */}
            <div className="space-y-5">
              {/* Customer Information */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-purple-600" /> Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-[11px] text-slate-400 mb-0.5">Store / Customer</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {order.customer_name}
                    </p>
                  </div>

                  {order.customer_contact_person && (
                    <div className="pt-3 border-t border-slate-100 dark:border-neutral-800">
                      <p className="text-[11px] text-slate-400 mb-0.5">Contact Person</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {order.customer_contact_person}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 dark:border-neutral-800">
                    <p className="text-[11px] text-slate-400 mb-0.5">Phone Number</p>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="text-sm font-semibold text-purple-600 hover:underline flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {order.customer_phone}
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Salesperson */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-indigo-600" /> Salesperson
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-[11px] text-slate-400 mb-0.5">Field Agent</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {order.sales_person_name}
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl bg-white dark:bg-neutral-900">
                <CardContent className="p-4 space-y-2.5 text-xs text-slate-500">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="h-3 w-3" /> Created
                    </span>
                    <strong className="text-slate-700 dark:text-slate-300 text-right">
                      {format(new Date(order.created_at), "MMM dd, yyyy")}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {format(new Date(order.created_at), "hh:mm a")}
                      </span>
                    </strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-neutral-800 pt-2.5">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3 w-3" /> Updated
                    </span>
                    <strong className="text-slate-700 dark:text-slate-300 text-right">
                      {format(new Date(order.updated_at), "MMM dd, yyyy")}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {format(new Date(order.updated_at), "hh:mm a")}
                      </span>
                    </strong>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      {/* Payment Receipt Lightbox */}
      <Dialog
        open={Boolean(selectedScreenshot)}
        onOpenChange={(open) => !open && setSelectedScreenshot(null)}
      >
        <DialogContent className="max-w-xl p-4">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-sm font-bold flex items-center justify-between">
              <span>Payment Receipt</span>
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

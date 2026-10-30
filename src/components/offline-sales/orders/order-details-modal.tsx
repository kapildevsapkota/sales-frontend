"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { OfflineOrder } from "@/types/offline-sales";
import {
  Package,
  User,
  Phone,
  Building,
  UserCheck,
  Calendar,
  DollarSign,
  FileText,
  Copy,
  Check,
  Layers,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface OrderDetailsModalProps {
  order: OfflineOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.order_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOrderStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered")) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">
          Delivered
        </Badge>
      );
    }
    if (s.includes("pending") || s.includes("process")) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300">
          {status}
        </Badge>
      );
    }
    if (s.includes("cancel")) {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300">
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
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300">
          Paid
        </Badge>
      );
    }
    if (s === "partial") {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300">
          Partial Payment
        </Badge>
      );
    }
    if (s === "unpaid" || s === "due") {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300">
          Unpaid
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const total = parseFloat(order.total_amount) || 0;
  const paid = parseFloat(order.paid_amount) || 0;
  const remaining = parseFloat(order.remaining_amount) || 0;
  const paidPercent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7">
        <DialogHeader className="border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Order {order.order_code}
              </DialogTitle>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                title="Copy order code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {getOrderStatusBadge(order.order_status)}
              {getPaymentStatusBadge(order.payment_status)}
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Order Date: {order.order_date}
            </span>
            <span>•</span>
            <span>ID: #{order.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-3">
          {/* Customer & Franchise Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="h-4 w-4 text-purple-600" /> Customer Information
              </h4>
              <div className="space-y-1 text-sm">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {order.customer_name}
                </div>
                {order.customer_contact_person && (
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Contact: <span className="font-medium">{order.customer_contact_person}</span>
                  </div>
                )}
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="text-purple-600 hover:underline"
                  >
                    {order.customer_phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-indigo-600" /> Franchise & Salesperson
              </h4>
              <div className="space-y-1 text-sm">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Franchise:{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {order.franchise_name}
                  </span>{" "}
                  <span className="text-slate-400 text-[11px]">
                    (#{order.franchise})
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  Sales Person:{" "}
                  <span className="font-medium text-slate-900 dark:text-white">
                    {order.sales_person_name}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    (#{order.sales_person})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Financial Summary */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600" /> Payment Summary
              </h4>
              <span className="text-xs font-medium text-slate-500">
                {paidPercent}% Paid
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  paidPercent === 100
                    ? "bg-emerald-500"
                    : paidPercent > 0
                    ? "bg-blue-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${paidPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-800/60">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Total Amount
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Rs. {total.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Paid Amount
                </div>
                <div className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                  Rs. {paid.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <div className="text-[11px] text-amber-600 dark:text-amber-400">
                  Remaining
                </div>
                <div className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400">
                  Rs. {remaining.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products / Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-purple-600" /> Order Items ({order.items?.length || 0})
              </h4>
            </div>

            <div className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-neutral-800/80 text-xs text-slate-500 border-b border-slate-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Inventory ID</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/40">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200 dark:border-neutral-700">
                              {item.product_image ? (
                                <Image
                                  src={item.product_image}
                                  alt={item.product_name}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {item.product_name}
                              </div>
                              <div className="text-xs text-slate-400">
                                Product ID: #{item.product_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-xs text-slate-600 dark:text-slate-400">
                          #{item.inventory}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                            {item.quantity} pcs
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 text-xs">
                        No item details recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks Section */}
          {order.remarks && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1">
              <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> Remarks / Notes
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                &ldquo;{order.remarks}&rdquo;
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-[11px] text-slate-400 flex flex-wrap justify-between border-t pt-3">
            <span>Created: {new Date(order.created_at).toLocaleString()}</span>
            <span>Last Updated: {new Date(order.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


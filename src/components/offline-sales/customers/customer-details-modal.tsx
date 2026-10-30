"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { OfflineCustomer } from "@/types/offline-sales";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Store,
  User,
  Phone,
  MapPin,
  Building,
  UserCheck,
  ShoppingBag,
  DollarSign,
  Calendar,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { isAxiosError } from "axios";
import Link from "next/link";

interface CustomerDetailsModalProps {
  customerId: number | null;
  initialCustomer?: OfflineCustomer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailsModal({
  customerId,
  initialCustomer,
  isOpen,
  onClose,
}: CustomerDetailsModalProps) {
  const [customer, setCustomer] = useState<OfflineCustomer | null>(
    initialCustomer || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    if (!isOpen || !customerId) {
      if (!isOpen) {
        setCustomer(null);
        setError(null);
      }
      return;
    }

    if (initialCustomer && initialCustomer.id === customerId) {
      setCustomer(initialCustomer);
    }

    let isMounted = true;

    async function fetchCustomerDetails() {
      try {
        setIsLoading(true);
        setError(null);

        // Call the requested endpoint: /api/offline-sales/customers/{id}
        let response;
        try {
          response = await api.get<OfflineCustomer>(
            `/api/offline-sales/customers/${customerId}/`
          );
        } catch (err: unknown) {
          if (
            isAxiosError(err) &&
            (err.response?.status === 404 || err.response?.status === 301)
          ) {
            response = await api.get<OfflineCustomer>(
              `/api/offline-sales/customers/${customerId}`
            );
          } else {
            throw err;
          }
        }

        if (isMounted) {
          setCustomer(response.data);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch customer details:", err);
        if (isMounted) {
          let msg = "Failed to load customer details.";
          if (isAxiosError<{ detail?: string }>(err)) {
            msg = err.response?.data?.detail || msg;
          }
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCustomerDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, customerId, initialCustomer]);

  const handleCopyPhone = () => {
    if (!customer?.phone_number) return;
    navigator.clipboard.writeText(customer.phone_number);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const purchased = customer?.total_purchased_amount || 0;
  const paid = customer?.total_paid_amount || 0;
  const remaining = customer?.total_remaining_amount || 0;
  const clearancePercent =
    purchased > 0 ? Math.min(100, Math.round((paid / purchased) * 100)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7">
        <DialogHeader className="border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {customer?.store_name || "Customer Details"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Offline Client #{customerId}
                </DialogDescription>
              </div>
            </div>

            {customer && (
              <Badge
                className={
                  customer.is_active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
                }
              >
                {customer.is_active ? "Active Client" : "Inactive"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
            <span className="text-xs text-slate-500">
              Loading customer details...
            </span>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {error}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (customerId) {
                  setCustomer(null);
                  setError(null);
                }
              }}
            >
              Retry
            </Button>
          </div>
        ) : customer ? (
          <div className="space-y-6 pt-3">
            {/* Primary Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Information */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-purple-600" /> Contact Info
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {customer.contact_person}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <a
                        href={`tel:${customer.phone_number}`}
                        className="text-purple-600 hover:underline"
                      >
                        {customer.phone_number}
                      </a>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy phone"
                    >
                      {copiedPhone ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  {customer.address && (
                    <div className="text-xs text-slate-500 flex items-start gap-1.5 pt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Franchise & Sales Person */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-indigo-600" /> Franchise &
                  Agent
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Franchise:{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {customer.franchise_name}
                    </span>{" "}
                    <span className="text-slate-400 text-[11px]">
                      (#{customer.franchise})
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    Sales Person:{" "}
                    <span className="font-medium text-slate-900 dark:text-white">
                      {customer.sales_person_name}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      (#{customer.sales_person})
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-purple-600" />
                    Total Orders:{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {customer.total_orders_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Performance */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-600" /> Financial
                  Breakdown
                </h4>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {clearancePercent}% Paid Off
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    clearancePercent === 100
                      ? "bg-emerald-500"
                      : clearancePercent > 0
                      ? "bg-blue-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${clearancePercent}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-800/60">
                  <div className="text-[11px] text-slate-500">
                    Total Purchases
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Rs. {purchased.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Total Paid
                  </div>
                  <div className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                    Rs. {paid.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <div className="text-[11px] text-amber-600 dark:text-amber-400">
                    Remaining Due
                  </div>
                  <div className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400">
                    Rs. {remaining.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-1">
              <Link href={`/offline-sales/orders`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>View Offline Orders</span>
                </Button>
              </Link>
            </div>

            {/* Timestamps */}
            <div className="text-[11px] text-slate-400 flex flex-wrap justify-between border-t pt-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created: {new Date(customer.created_at).toLocaleString()}
              </span>
              <span>
                Updated: {new Date(customer.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}


"use client";

import {
  FileText,
  Printer,
  Edit,
  Eye,
  MessageSquare,
  Loader2,
  Search,
  CalendarIcon,
  X,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import {
  useVendorOrders,
  useOrderDetails,
  useUpdateOrderDetails,
  useDeleteOrder,
} from "./orders.queries";

import { type ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { usePostComment } from "./order-details/order-details.queries";
import { OrderDetailsView } from "./order-details/order-details.view";
import { useState, useMemo, useEffect } from "react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { exportOrders, type Order, type UpdateOrderPayload } from "./orders";

// ─── Comment Popover ──────────────────────────────────────────────────────────

function CommentPopover({ trackingNumber }: { trackingNumber: string }) {
  const [comment, setComment] = useState("");
  const mutation = usePostComment();

  const handlePost = () => {
    if (!comment.trim()) return;
    mutation.mutate(
      { trackingNumber, comment },
      {
        onSuccess: () => setComment(""),
      },
    );
  };

  return (
    <div className="grid gap-3">
      <div className="text-sm font-medium text-gray-700">Add a Comment</div>
      <textarea
        className="w-full border border-gray-200 rounded p-2 text-xs focus:outline-none min-h-[80px] resize-none"
        placeholder="Type your message here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={mutation.isPending}
      />
      <Button
        size="sm"
        className="w-full"
        onClick={handlePost}
        disabled={mutation.isPending || !comment.trim()}
      >
        {mutation.isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          "Post Comment"
        )}
      </Button>
    </div>
  );
}

// ─── Status & filter options ──────────────────────────────────────────────────

const STATUS_CHOICES = [
  { label: "Order Placed", value: "ORDER_PLACED" },
  { label: "Order Verified", value: "ORDER_VERIFIED" },
  { label: "Received At Office", value: "RECEIVED_AT_OFFICE" },
  { label: "Ready for Dispatch", value: "READY_FOR_DISPATCH" },
  { label: "Order Dispatched", value: "ORDER_DISPATCHED" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Rescheduled", value: "RESCHEDULED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Returning to Vendor", value: "RETURNING_TO_VENDOR" },
  { label: "Returned to Vendor", value: "RETURNED_TO_VENDOR" },
  { label: "On Hold", value: "ON_HOLD" },
];

const DELIVERY_LOCATION_CHOICES = [
  { label: "Inside Ringroad", value: "Inside Ringroad" },
  { label: "Outside Ringroad", value: "Outside Ringroad" },
];

// ─── Filter types ─────────────────────────────────────────────────────────────

type AppliedFilters = {
  search: string;
  status: string;
  deliveryLocation: string;
  dateRange: DateRange | undefined;
};

// ─── FilterBar ────────────────────────────────────────────────────────────────

const FilterBar = React.memo(function FilterBar({
  onFilter,
  onReset,
  appliedFilters,
  totalOrders,
  onExport,
  isExporting,
  onPrint,
  hideStatusFilter = false,
}: {
  onFilter: (filters: AppliedFilters) => void;
  onReset: () => void;
  appliedFilters: AppliedFilters;
  totalOrders: number;
  onExport: () => void;
  isExporting: boolean;
  onPrint: () => void;
  hideStatusFilter?: boolean;
}) {
  const [searchInput, setSearchInput] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [draftDeliveryLocation, setDraftDeliveryLocation] = useState("");
  const [draftDateRange, setDraftDateRange] = useState<DateRange | undefined>(
    undefined,
  );

  const {
    search: appliedSearch,
    status: appliedStatus,
    deliveryLocation: appliedDeliveryLocation,
    dateRange: appliedDateRange,
  } = appliedFilters;

  const isFilterApplied = !!(
    appliedSearch ||
    (!hideStatusFilter && appliedStatus) ||
    appliedDeliveryLocation ||
    appliedDateRange?.from
  );

  const isDraftDifferent =
    searchInput !== appliedSearch ||
    (!hideStatusFilter && draftStatus !== appliedStatus) ||
    draftDeliveryLocation !== appliedDeliveryLocation ||
    draftDateRange !== appliedDateRange;

  const showClearAll = isFilterApplied && !isDraftDifferent;

  const handleFilter = () =>
    onFilter({
      search: searchInput,
      status: draftStatus,
      deliveryLocation: draftDeliveryLocation,
      dateRange: draftDateRange,
    });

  const handleReset = () => {
    setSearchInput("");
    setDraftStatus("");
    setDraftDeliveryLocation("");
    setDraftDateRange(undefined);
    onReset();
  };

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-6",
          hideStatusFilter ? "md:grid-cols-2" : "md:grid-cols-3",
        )}
      >
        {/* Search */}
        <div className="relative flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
            Search
          </label>
          <div
            className={`flex items-center border rounded-xs transition-colors ${appliedSearch ? "border-orange-400" : "border-gray-200"}`}
          >
            <Search className="ml-2 mt-1 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="e.g. Tracking code, recipient name"
              className="w-full border-none rounded p-2 pt-3 text-xs focus:outline-none bg-transparent"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  onFilter({
                    search: "",
                    status: draftStatus,
                    deliveryLocation: draftDeliveryLocation,
                    dateRange: draftDateRange,
                  });
                }}
                className="mr-2 mt-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        {!hideStatusFilter && (
          <div className="relative flex flex-col gap-1.5">
            {draftStatus && (
              <Button
                title="clear"
                variant="secondary"
                onClick={() => {
                  setDraftStatus("");
                  onFilter({
                    search: searchInput,
                    status: "",
                    deliveryLocation: draftDeliveryLocation,
                    dateRange: draftDateRange,
                  });
                }}
                className="absolute -top-2 rounded-xs right-0 w-3 h-3 p-2 z-20"
              >
                <X className="w-1 h-1" />
              </Button>
            )}
            <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
              Select Status
            </label>
            <Select
              value={draftStatus}
              onValueChange={(v) => setDraftStatus(v || "")}
            >
              <SelectTrigger
                className={`w-full rounded-xs p-2 pt-3 text-xs text-gray-500 bg-white shadow-none focus:ring-0 transition-colors ${appliedStatus ? "border-orange-400" : "border-gray-200"}`}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_CHOICES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Delivery Location */}
        <div className="flex relative flex-col gap-1.5">
          {draftDeliveryLocation && (
            <Button
              title="clear"
              variant="secondary"
              onClick={() => {
                setDraftDeliveryLocation("");
                onFilter({
                  search: searchInput,
                  status: draftStatus,
                  deliveryLocation: "",
                  dateRange: draftDateRange,
                });
              }}
              className="absolute -top-2 rounded-xs right-0 w-3 h-3 p-2 z-20"
            >
              <X className="w-1 h-1" />
            </Button>
          )}
          <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
            Delivery Location Type
          </label>
          <Select
            value={draftDeliveryLocation}
            onValueChange={(v) => setDraftDeliveryLocation(v || "")}
          >
            <SelectTrigger
              className={`w-full h-auto rounded-xs p-2 pt-3 text-xs text-gray-500 bg-white shadow-none focus:ring-0 transition-colors ${appliedDeliveryLocation ? "border-orange-400" : "border-gray-200"}`}
            >
              <SelectValue placeholder="Select Delivery Location Type" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERY_LOCATION_CHOICES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="relative flex flex-col gap-1.5">
          {draftDateRange?.from && (
            <Button
              title="clear"
              variant="secondary"
              onClick={() => {
                setDraftDateRange(undefined);
                onFilter({
                  search: searchInput,
                  status: draftStatus,
                  deliveryLocation: draftDeliveryLocation,
                  dateRange: undefined,
                });
              }}
              className="absolute -top-2 rounded-xs right-0 w-3 h-3 p-2 z-20"
            >
              <X className="w-1 h-1" />
            </Button>
          )}
          <label className="text-[11px] font-medium text-gray-500 bg-white px-1 -mb-3 z-10 w-fit ml-2 relative">
            Date Range
          </label>
          <Popover>
            <PopoverTrigger
              id="date-picker-range"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  className:
                    "justify-start px-2.5 font-normal h-10 w-full rounded-xs text-xs text-gray-600 transition-colors",
                }),
                appliedDateRange?.from
                  ? "border-orange-400"
                  : "border-gray-200",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {draftDateRange?.from ? (
                draftDateRange.to ? (
                  <>
                    {format(draftDateRange.from, "LLL dd, y")} –{" "}
                    {format(draftDateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(draftDateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={draftDateRange?.from}
                selected={draftDateRange}
                onSelect={setDraftDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-0.5">
          <Button onClick={handleFilter} className="m-0">
            Filter Orders
          </Button>
          {showClearAll && (
            <div className="flex items-center">
              <Button
                title="clear all filters"
                size="icon-xs"
                onClick={handleReset}
                className="p-0 m-0"
              >
                <X className="h-4 w-4 text-white" />
              </Button>
              <span className="text-xs ml-2">Found {totalOrders} orders</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={onExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              ""
            )}
            Export To Excel
          </Button>
          <Button variant="secondary" onClick={onPrint}>
            <Printer className="h-3.5 w-3.5" /> Print Selected
          </Button>
        </div>
      </div>
    </>
  );
});

// ─── Tracking Code Cell ───────────────────────────────────────────────────────

function TrackingCodeCell({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group w-full h-full flex items-center justify-center p-3">
      <div className="absolute w-full h-full inset-0 pointer-events-none">
        <div className="absolute group-hover:opacity-100 opacity-0 right-1 bottom-1 pointer-events-auto">
          <button
            onClick={handleCopy}
            className="p-1 bg-slate-200 hover:bg-slate-300 text-gray-400 hover:text-gray-500 rounded-xs transition-colors"
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
      <span className="text-[#d85860] font-medium">{value}</span>
    </div>
  );
}

// ─── Edit Order Modal ─────────────────────────────────────────────────────────

const editOrderSchema = z.object({
  recipient_name: z.string().min(1, "Recipient name is required"),
  recipient_phone: z.string().min(1, "Phone is required"),
  recipient_email: z.string().email("Invalid email").or(z.literal("")),
  recipient_address: z.string().min(1, "Address is required"),
  recipient_city: z.string().min(1, "City is required"),
  recipient_district: z.string(),
  cod_amount: z.string(),
  delivery_charge: z.string(),
  payment_type: z.string(),
  special_instructions: z.string(),
  remarks: z.string(),
});

type EditOrderFormValues = z.infer<typeof editOrderSchema>;

function EditOrderModal({
  trackingNumber,
  open,
  onClose,
}: {
  trackingNumber: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: order, isLoading } = useOrderDetails(
    trackingNumber ?? undefined,
  );
  const updateMutation = useUpdateOrderDetails();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditOrderFormValues>({
    resolver: zodResolver(editOrderSchema),
    defaultValues: {
      recipient_name: "",
      recipient_phone: "",
      recipient_email: "",
      recipient_address: "",
      recipient_city: "",
      recipient_district: "",
      cod_amount: "",
      delivery_charge: "",
      payment_type: "",
      special_instructions: "",
      remarks: "",
    },
  });

  useEffect(() => {
    if (order) {
      reset({
        recipient_name: order.recipient_name ?? "",
        recipient_phone: order.recipient_phone ?? "",
        recipient_email: order.recipient_email ?? "",
        recipient_address: order.recipient_address ?? "",
        recipient_city: order.recipient_city ?? "",
        recipient_district: order.recipient_district ?? "",
        cod_amount: order.cod_amount ?? "",
        delivery_charge: order.delivery_charge ?? "",
        payment_type: order.payment_type ?? "",
        special_instructions: order.special_instructions ?? "",
        remarks: order.remarks ?? "",
      });
    }
  }, [order, reset]);

  const onSubmit = (data: EditOrderFormValues) => {
    if (!trackingNumber) return;
    updateMutation.mutate(
      { trackingNumber, data: data as UpdateOrderPayload },
      { onSuccess: onClose },
    );
  };

  const inputCls =
    "border border-gray-200 rounded-xs px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 w-full";
  const textareaCls = `${inputCls} resize-none`;
  const labelCls = "text-[10px] text-gray-500";
  const errorCls = "text-[10px] text-red-500 mt-0.5";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          {trackingNumber && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              Tracking:{" "}
              <span className="text-[#d85860] font-medium">
                {trackingNumber}
              </span>
            </p>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <form
            id="edit-order-form"
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2"
          >
            <div className="sm:col-span-2">
              <p className="text-[10px] font-medium text-gray-400 uppercase mb-2">
                Recipient Info
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient Name</label>
              <input {...register("recipient_name")} className={inputCls} />
              {errors.recipient_name && (
                <p className={errorCls}>{errors.recipient_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient Phone</label>
              <input {...register("recipient_phone")} className={inputCls} />
              {errors.recipient_phone && (
                <p className={errorCls}>{errors.recipient_phone.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient Email</label>
              <input
                type="email"
                {...register("recipient_email")}
                className={inputCls}
              />
              {errors.recipient_email && (
                <p className={errorCls}>{errors.recipient_email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient City</label>
              <input {...register("recipient_city")} className={inputCls} />
              {errors.recipient_city && (
                <p className={errorCls}>{errors.recipient_city.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient District</label>
              <input {...register("recipient_district")} className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Recipient Address</label>
              <textarea
                rows={2}
                {...register("recipient_address")}
                className={textareaCls}
              />
              {errors.recipient_address && (
                <p className={errorCls}>{errors.recipient_address.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 border-t border-gray-100 pt-3">
              <p className="text-[10px] font-medium text-gray-400 uppercase mb-2">
                Order Info
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>COD Amount</label>
              <input {...register("cod_amount")} className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Delivery Charge</label>
              <input {...register("delivery_charge")} className={inputCls} />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Payment Type</label>
              <Controller
                control={control}
                name="payment_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border border-gray-200 rounded-xs px-2 py-1.5 h-auto text-xs focus:outline-none focus:ring-0 focus:border-gray-400 bg-white w-full shadow-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">COD</SelectItem>
                      <SelectItem value="PREPAID">Prepaid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Special Instructions</label>
              <textarea
                rows={2}
                {...register("special_instructions")}
                className={textareaCls}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelCls}>Remarks</label>
              <textarea
                rows={2}
                {...register("remarks")}
                className={textareaCls}
              />
            </div>
          </form>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            type="submit"
            form="edit-order-form"
            disabled={updateMutation.isPending || isLoading}
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function MyOrdersView({
  fixedStatus,
  title = "My Orders",
}: {
  /** Lock the status filter to this value and hide the dropdown. */
  fixedStatus?: string;
  title?: string;
} = {}) {
  const router = useRouter();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<
    Record<string, boolean>
  >({});
  const [editingTrackingNumber, setEditingTrackingNumber] = useState<
    string | null
  >(null);
  const [viewTrackingNumber, setViewTrackingNumber] = useState<string | null>(
    null,
  );
  const [deletingTrackingNumber, setDeletingTrackingNumber] = useState<
    string | null
  >(null);

  const { mutate: deleteOrderMutate } = useDeleteOrder();

  // ── Applied filter state (committed on "Filter" click) ──────────────────────
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState(fixedStatus ?? "");
  const [appliedDeliveryLocation, setAppliedDeliveryLocation] = useState("");
  const [appliedDateRange, setAppliedDateRange] = useState<
    DateRange | undefined
  >(undefined);

  const startDate = appliedDateRange?.from
    ? format(appliedDateRange.from, "yyyy-MM-dd")
    : "";
  const endDate = appliedDateRange?.to
    ? format(appliedDateRange.to, "yyyy-MM-dd")
    : "";

  const handleFilter = (filters: AppliedFilters) => {
    setAppliedSearch(filters.search);
    setAppliedStatus(fixedStatus ?? filters.status);
    setAppliedDeliveryLocation(filters.deliveryLocation);
    setAppliedDateRange(filters.dateRange);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleReset = () => {
    setAppliedSearch("");
    setAppliedStatus(fixedStatus ?? "");
    setAppliedDeliveryLocation("");
    setAppliedDateRange(undefined);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportOrders(
        appliedSearch,
        appliedStatus,
        appliedDeliveryLocation,
        startDate,
        endDate,
      );
      toast.success("Orders exported successfully");
    } catch {
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const allOrders = orders?.results ?? [];
    const selectedOrders = allOrders.filter(
      (o) => selectedOrderIds[o.tracking_number],
    );
    const ordersToPrint =
      selectedOrders.length > 0 ? selectedOrders : allOrders;

    const printDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const tableRows = ordersToPrint
      .map(
        (order, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${order.tracking_number}</td>
        <td>${order.recipient_name}</td>
        <td>${order.recipient_phone}</td>
        <td>${order.recipient_address}, ${order.recipient_city}${order.recipient_district ? ", " + order.recipient_district : ""}</td>
        <td>${order.payment_type}</td>
        <td>${order.cod_amount}</td>
        <td>${order.status}</td>
      </tr>
    `,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>YDM – Orders</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; background: #fff; padding: 24px 32px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e8611a; }
    .header img { height: 48px; width: auto; }
    .header-right { text-align: right; color: #555; font-size: 10px; line-height: 1.6; }
    h1 { font-size: 14px; font-weight: bold; margin-bottom: 4px; text-align: center; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    thead tr { background: #2e4a62; color: #fff; }
    thead th { padding: 6px 8px; text-align: left; border: 1px solid #1e3448; white-space: nowrap; }
    tbody tr:nth-child(even) { background: #f5f8fb; }
    tbody tr:nth-child(odd) { background: #fff; }
    tbody td { padding: 5px 8px; border: 1px solid #d0d7de; vertical-align: top; }
    .summary { margin: 12px 0 0; font-size: 10px; color: #555; }
    @media print { body { padding: 12px 16px; } @page { margin: 1cm; size: A4 landscape; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="/ydm-logo.webp" alt="YDM Logo" />
    <div class="header-right">
      <div>Print Date: ${printDate}</div>
      <div>Total Orders: ${ordersToPrint.length}</div>
    </div>
  </div>
  <h1>Order Package Report</h1><br/>
  <table>
    <thead>
      <tr><th>#</th><th>Tracking No.</th><th>Recipient Name</th><th>Phone</th><th>Address</th><th>Payment</th><th>COD (Rs.)</th><th>Status</th></tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <p class="summary">Total records: ${ordersToPrint.length}</p>
  <script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  const { data: orders, isLoading } = useVendorOrders(
    pagination.pageIndex + 1,
    pagination.pageSize,
    appliedSearch,
    appliedStatus,
    appliedDeliveryLocation,
    startDate,
    endDate,
  );

  const pageCount = orders?.count
    ? Math.ceil(orders.count / pagination.pageSize)
    : 0;

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center gap-1">
            <Checkbox
              className="cursor-pointer"
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(checked) =>
                table.toggleAllPageRowsSelected(!!checked)
              }
            />
          </div>
        ),
        cell: ({ row }) => {
          const isSelected = row.getIsSelected();
          return (
            <div
              onClick={(e) => {
                e.stopPropagation();
                row.toggleSelected();
              }}
              className="flex items-center group justify-center cursor-pointer absolute border border-dashed border-transparent hover:border-orange-400 inset-0 w-full h-full text-center"
            >
              {!isSelected ? (
                <div className="relative flex items-center justify-center w-4 h-4 pointer-events-none">
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => {}}
                    className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity"
                  />
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => {}}
                    className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity"
                  />
                </div>
              ) : (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => {}}
                  className="pointer-events-none"
                />
              )}
            </div>
          );
        },
        size: 60,
      },
      {
        id: "sn",
        header: "S.N.",
        cell: ({ row }) => (
          <span className="text-gray-600 font-medium text-center block">
            {row.index + 1}
          </span>
        ),
        size: 50,
      },
      {
        id: "orderedOn",
        header: "Ordered On",
        cell: ({ row }) => {
          const d = new Date(row.original.created_at);
          return (
            <div className="bg-[#5a6268] text-white text-[10px] rounded px-2 py-1 mx-auto w-fit font-medium text-center">
              <div>
                {d.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div>
                {d.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        },
      },
      {
        id: "customerInfo",
        header: "Customer Info",
        cell: ({ row }) => (
          <div className="text-gray-700">
            <div className="font-medium">{row.original.recipient_name}</div>
            <div>{row.original.recipient_phone}</div>
            <div className="font-light mt-1">
              {row.original.recipient_address}
            </div>
          </div>
        ),
      },
      {
        id: "tracking_code",
        accessorKey: "tracking_number",
        header: "Tracking Code",
        cell: ({ getValue }) => (
          <TrackingCodeCell value={getValue() as string} />
        ),
      },
      {
        accessorKey: "status",
        header: () => (
          <div className="text-center">
            Current
            <br />
            Status
          </div>
        ),
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className="inline-block px-2 py-1 bg-gray-100 rounded-xs text-[10px] uppercase font-semibold text-gray-600">
              {getValue() as string}
            </span>
          </div>
        ),
      },
      {
        id: "price",
        header: "Total Price (Rs.)",
        cell: ({ row }) => (
          <div className="text-gray-700 min-w-[140px]">
            <div>Collection Amount: {row.original.cod_amount}</div>
            <div>Delivery Charge: {row.original.delivery_charge}</div>
          </div>
        ),
      },
      {
        id: "rider",
        header: "Rider",
        cell: ({ row }) => (
          <div className="text-gray-700 min-w-[140px]">
            <span>{row.original.assigned_rider_name || "—"}</span>
          </div>
        ),
      },
      {
        id: "action",
        header: () => <div className="text-center min-w-[80px]">Action</div>,
        cell: ({ row }) => {
          const isOrderPlaced = row.original.status === "ORDER_PLACED";
          return (
            <TooltipProvider delayDuration={100}>
              <div className="flex gap-0.5 items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTrackingNumber(row.original.tracking_number);
                      }}
                      variant="default"
                      size="icon-xs"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>

                {isOrderPlaced && (
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <AlertDialogTrigger asChild>
                            <Button
                              onClick={(e) => e.stopPropagation()}
                              variant="destructive"
                              size="icon-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete order{" "}
                          <span className="font-medium text-gray-700">
                            {row.original.tracking_number}
                          </span>. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={
                            deletingTrackingNumber ===
                            row.original.tracking_number
                          }
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={
                            deletingTrackingNumber ===
                            row.original.tracking_number
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            setDeletingTrackingNumber(
                              row.original.tracking_number,
                            );
                            deleteOrderMutate(row.original.tracking_number, {
                              onSuccess: () =>
                                setDeletingTrackingNumber(null),
                              onError: () =>
                                setDeletingTrackingNumber(null),
                            });
                          }}
                        >
                          {deletingTrackingNumber ===
                            row.original.tracking_number && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewTrackingNumber(row.original.tracking_number);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Details</TooltipContent>
                </Tooltip>

                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Comment</TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    onClick={(e) => e.stopPropagation()}
                    className="w-80"
                  >
                    <CommentPopover
                      trackingNumber={row.original.tracking_number}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipProvider>
          );
        },
      },
    ],
    [],
  );

  const memoizedAppliedFilters = useMemo(
    () => ({
      search: appliedSearch,
      status: appliedStatus,
      deliveryLocation: appliedDeliveryLocation,
      dateRange: appliedDateRange,
    }),
    [appliedSearch, appliedStatus, appliedDeliveryLocation, appliedDateRange],
  );

  const getRowId = React.useCallback((row: Order) => row.tracking_number, []);

  return (
    <div className="flex flex-col gap-6 w-full bg-white p-6 md:p-8 rounded-sm border border-gray-200">
      <div className="pb-2">
        <h2 className="text-sm font-bold text-[#2e4a62] uppercase border-b-2 border-orange-400 inline-block pb-2 -mb-[2.5px]">
          {title}
        </h2>
      </div>

      <FilterBar
        onFilter={handleFilter}
        onReset={handleReset}
        appliedFilters={memoizedAppliedFilters}
        totalOrders={orders?.count ?? 0}
        onExport={handleExport}
        isExporting={isExporting}
        onPrint={handlePrint}
        hideStatusFilter={!!fixedStatus}
      />

      <div className="mt-4">
        <DataTable
          data={orders?.results ?? []}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No orders found."
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>

      <EditOrderModal
        trackingNumber={editingTrackingNumber}
        open={editingTrackingNumber !== null}
        onClose={() => setEditingTrackingNumber(null)}
      />

      <Dialog
        open={viewTrackingNumber !== null}
        onOpenChange={(open) => !open && setViewTrackingNumber(null)}
      >
        <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewTrackingNumber && (
            <OrderDetailsView trackingNumber={viewTrackingNumber} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Column, SaleItem } from "@/types/sale";
import { getOrderStatusColor } from "../utils/order-status";
import { DashLocationCell } from "@/components/salesTable/components/DashLocationCell";
import { JSX } from "react";

interface FranchiseOrdersTableBodyProps {
  tableRef: React.RefObject<HTMLTableElement>;
  columns: Column[];
  isLoading: boolean;
  displayData: SaleItem[];
  currentPage: number;
  pageSize: number;
  getValueByColumnId: (
    sale: SaleItem,
    columnId: string,
  ) => string | number | JSX.Element;
  onViewPaymentImage: (url: string) => void;
  selectableRows?: boolean;
  selectedOrderIds?: number[];
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (id: number, checked: boolean) => void;
  handleOrderStatusChange?: (sale: SaleItem, newStatus: string) => void;
  handleLogisticsChange?: (saleId: string, logisticsId: string) => void;
  onLocationUpdate?: (
    saleId: number,
    location: { id: number; name: string },
  ) => void;
  selectedLogisticFilter?: string;
}

const ORDER_STATUS_OPTIONS = [
  "Pending",
  "Processing",
  "Sent to YDM",
  "Sent to Dash",
  "Sent to PicknDrop",
  "Sent to Daraz",
  "Out For Delivery",
  "Returned By YDM",
  "Returned By PicknDrop",
  "Verified",
  "Indrive",
  "Delivered",
  "Rescheduled",
  "Cancelled",
  "Returned By Customer",
  "Returned By Dash",
  "Returned By Daraz",
  "Return Pending",
];

const getOrderStatusDotColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-500";
    case "Processing":
    case "Sent to PicknDrop":
      return "bg-blue-500";
    case "Pending":
    case "Sent to Dash":
      return "bg-yellow-500";
    case "Sent to YDM":
      return "bg-yellow-600";
    case "Sent to Daraz":
      return "bg-amber-500";
    case "Verified":
    case "Returned By Dash":
      return "bg-purple-500";
    case "Out For Delivery":
      return "bg-indigo-500";
    case "Returned By PicknDrop":
    case "Cancelled":
      return "bg-red-500";
    case "Returned By YDM":
      return "bg-rose-500";
    case "Returned By Customer":
      return "bg-sky-500";
    case "Returned By Daraz":
      return "bg-fuchsia-500";
    case "Rescheduled":
    case "Return Pending":
      return "bg-orange-500";
    case "Indrive":
      return "bg-teal-500";
    default:
      return "bg-gray-400";
  }
};

const isDarazLogistics = (sale: SaleItem) => {
  const logistics = sale.logistics || sale.logistics_name || "";
  return logistics.toLowerCase().includes("daraz");
};

const normalizeLogisticsForSelect = (logistics?: string | null): string => {
  if (!logistics) return "";

  const normalized = logistics
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  switch (normalized) {
    case "ydm":
      return "YDM";
    case "dash":
      return "DASH";
    case "ncm":
      return "NCM";
    case "pickndrop":
      return "PicknDrop";
    case "pathao":
      return "Pathao";
    case "daraz":
      return "Daraz";
    case "none":
      return "none";
    default:
      return logistics;
  }
};

export function FranchiseOrdersTableBody({
  tableRef,
  columns,
  isLoading,
  displayData,
  currentPage,
  pageSize,
  getValueByColumnId,
  onViewPaymentImage,
  selectableRows = false,
  selectedOrderIds = [],
  onSelectAll,
  onSelectRow,
  handleOrderStatusChange,
  handleLogisticsChange,
  onLocationUpdate,
  selectedLogisticFilter,
}: FranchiseOrdersTableBodyProps) {
  const [darazCancelDialog, setDarazCancelDialog] = useState<{
    open: boolean;
    saleId: string | null;
    reason: string;
    isSubmitting: boolean;
  }>({
    open: false,
    saleId: null,
    reason: "",
    isSubmitting: false,
  });

  const onStatusChange = (sale: SaleItem, newStatus: string) => {
    if (newStatus === "Cancelled" && isDarazLogistics(sale)) {
      setDarazCancelDialog({
        open: true,
        saleId: String(sale.id),
        reason: "",
        isSubmitting: false,
      });
      return;
    }

    handleOrderStatusChange?.(sale, newStatus);
  };

  const handleDarazCancelSubmit = async () => {
    if (!darazCancelDialog.saleId) return;

    const reason = darazCancelDialog.reason.trim();
    if (!reason) {
      toast.error("Please provide a cancellation reason.");
      return;
    }

    setDarazCancelDialog((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await api.post(`/api/daraz/orders/${darazCancelDialog.saleId}/cancel/`, {
        reason,
      });
      const sale = displayData.find(
        (item) => String(item.id) === darazCancelDialog.saleId,
      );
      if (sale && handleOrderStatusChange) {
        await handleOrderStatusChange(sale, "Cancelled");
      }
      toast.success("Daraz order cancelled successfully.");
      setDarazCancelDialog({
        open: false,
        saleId: null,
        reason: "",
        isSubmitting: false,
      });
    } catch (error) {
      console.error("Error cancelling Daraz order:", error);
      toast.error("Failed to cancel Daraz order.");
      setDarazCancelDialog((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const closeDarazCancelDialog = () => {
    if (darazCancelDialog.isSubmitting) return;
    setDarazCancelDialog({
      open: false,
      saleId: null,
      reason: "",
      isSubmitting: false,
    });
  };

  const visibleColumns = columns.filter((col) => col.visible);
  const isAllSelected =
    displayData.length > 0 &&
    displayData.every((item) => selectedOrderIds.includes(item.id));
  const isSomeSelected =
    displayData.some((item) => selectedOrderIds.includes(item.id)) &&
    !isAllSelected;

  return (
    <>
      <table
        ref={tableRef}
        className="w-full border-collapse whitespace-nowrap text-sm"
        style={{ minWidth: "100%" }}
      >
        <thead>
          <tr className="bg-gray-50">
            {selectableRows && (
              <th className="border p-2 text-center w-10 min-w-10">
                <Checkbox
                  checked={
                    isAllSelected
                      ? true
                      : isSomeSelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={(checked) =>
                    onSelectAll && onSelectAll(!!checked)
                  }
                  aria-label="Select all orders"
                />
              </th>
            )}
            {visibleColumns.map((column) => (
              <th
                key={column.id}
                className="border p-2 text-left"
                style={{
                  width: `${column.width}px`,
                  minWidth: `${column.width}px`,
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <tr key={`skeleton-${index}`}>
                {selectableRows && (
                  <td
                    key={`skeleton-cell-select-${index}`}
                    className="border p-2"
                  >
                    <Skeleton className="h-4 w-4 mx-auto" />
                  </td>
                )}
                {visibleColumns.map((column) => (
                  <td
                    key={`skeleton-cell-${index}-${column.id}`}
                    className="border p-2"
                  >
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : displayData.length > 0 ? (
            displayData.map((sale, index) => {
              const isSelected = selectedOrderIds.includes(sale.id);
              return (
                <tr
                  key={sale.id}
                  className={`${index % 2 === 0 ? "" : "bg-gray-50"} ${
                    isSelected ? "bg-slate-100/80 dark:bg-neutral-800/50" : ""
                  }`}
                >
                  {selectableRows && (
                    <td className="border p-2 text-center w-10 min-w-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          onSelectRow && onSelectRow(sale.id, !!checked)
                        }
                        aria-label={`Select order ${sale.order_code || sale.id}`}
                      />
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td
                      key={`${sale.id}-${column.id}`}
                      className="border p-2"
                      style={{
                        width: `${column.width}px`,
                        minWidth: `${column.width}px`,
                      }}
                    >
                      {column.id === "index" ? (
                        (currentPage - 1) * pageSize + index + 1
                      ) : column.id === "order_status" ? (
                        <div className="flex items-center min-w-[130px]">
                          {handleOrderStatusChange ? (
                            <Select
                              value={sale.order_status}
                              onValueChange={(value) =>
                                onStatusChange(sale, value)
                              }
                            >
                              <SelectTrigger className="w-full h-8 bg-white border border-gray-300 rounded-md shadow-xs">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
                                {ORDER_STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    <span
                                      className={`${getOrderStatusDotColor(
                                        status,
                                      )} rounded-full w-2.5 h-2.5 inline-block mr-2`}
                                    />
                                    {status}
                                  </SelectItem>
                                ))}
                                {sale.order_status &&
                                  !ORDER_STATUS_OPTIONS.includes(
                                    sale.order_status,
                                  ) && (
                                    <SelectItem value={sale.order_status}>
                                      <span className="bg-gray-400 rounded-full w-2.5 h-2.5 inline-block mr-2" />
                                      {sale.order_status}
                                    </SelectItem>
                                  )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getOrderStatusColor(
                                sale.order_status,
                              )}`}
                            >
                              {sale.order_status}
                            </span>
                          )}
                        </div>
                      ) : column.id === "logistics_name" ? (
                        <div className="flex items-center min-w-[110px]">
                          {handleLogisticsChange ? (
                            <Select
                              value={normalizeLogisticsForSelect(
                                sale.logistics,
                              )}
                              onValueChange={(value) =>
                                handleLogisticsChange(String(sale.id), value)
                              }
                            >
                              <SelectTrigger className="w-full h-8 bg-white border border-gray-300 rounded-md shadow-xs">
                                <SelectValue placeholder="Logistics" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                                <SelectItem value="YDM">YDM</SelectItem>
                                <SelectItem value="DASH">DASH</SelectItem>
                                <SelectItem value="NCM">NCM</SelectItem>
                                <SelectItem value="PicknDrop">
                                  PicknDrop
                                </SelectItem>
                                <SelectItem value="Pathao">Pathao</SelectItem>
                                <SelectItem value="Daraz">Daraz</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>
                              {sale.logistics || sale.logistics_name || "-"}
                            </span>
                          )}
                        </div>
                      ) : column.id === "location_name" ? (
                        <DashLocationCell
                          key={`${sale.id}-${sale.location_name || ""}`}
                          sale={sale}
                          onLocationUpdate={onLocationUpdate}
                          fallbackLogistics={selectedLogisticFilter}
                        />
                      ) : column.id === "payment_method" ? (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            {sale.payment_method === "Cash on Delivery"
                              ? "COD"
                              : sale.payment_method === "Prepaid"
                                ? "PP"
                                : sale.payment_method === "Office Visit"
                                  ? "OV"
                                  : sale.payment_method}
                            {sale.payment_method === "Prepaid" &&
                              sale.prepaid_amount && (
                                <span className="text-xs text-gray-500">
                                  Rs. {sale.prepaid_amount.toLocaleString()}
                                </span>
                              )}
                          </div>
                          {(sale.payment_method === "Prepaid" ||
                            sale.payment_method === "Office Visit" ||
                            sale.payment_method === "Indrive") &&
                            sale.payment_screenshot && (
                              <Eye
                                className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewPaymentImage(sale.payment_screenshot);
                                }}
                              />
                            )}
                        </div>
                      ) : column.id === "franchise" ? (
                        <div className="flex flex-col gap-0.5 min-w-[130px]">
                          <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                            {sale.sales_person?.franchise || (sale as any).franchise || "—"}
                          </span>
                          {sale.sales_person?.distributor && (
                            <span className="text-[10px] text-muted-foreground truncate">
                              {sale.sales_person.distributor}
                            </span>
                          )}
                        </div>
                      ) : column.id === "delivery_location" ||
                        column.id === "product_sold" ? (
                        <div className="whitespace-normal break-words">
                          {column.id === "product_sold"
                            ? sale.order_products.map((item, idx) => (
                                <div key={item.id || idx}>
                                  {item.product.name} - {item.quantity}
                                </div>
                              ))
                            : getValueByColumnId(sale, column.id)}
                        </div>
                      ) : (
                        getValueByColumnId(sale, column.id)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={visibleColumns.length + (selectableRows ? 1 : 0)}
                className="border p-2 text-center"
              >
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Dialog
        open={darazCancelDialog.open}
        onOpenChange={(open) => !open && closeDarazCancelDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Daraz Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this Daraz order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="daraz-cancel-reason">Cancellation reason</Label>
            <Textarea
              id="daraz-cancel-reason"
              placeholder="Enter cancellation reason..."
              value={darazCancelDialog.reason}
              onChange={(e) =>
                setDarazCancelDialog((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              disabled={darazCancelDialog.isSubmitting}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDarazCancelDialog}
              disabled={darazCancelDialog.isSubmitting}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleDarazCancelSubmit}
              disabled={darazCancelDialog.isSubmitting}
            >
              {darazCancelDialog.isSubmitting ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

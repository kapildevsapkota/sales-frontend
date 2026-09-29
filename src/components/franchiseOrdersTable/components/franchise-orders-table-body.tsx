"use client";

import type React from "react";
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
  handleLogisticsChange?: (saleId: string, logisticsId: string) => void;
  onLocationUpdate?: (
    saleId: number,
    location: { id: number; name: string },
  ) => void;
  selectedLogisticFilter?: string;
}

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
  handleLogisticsChange,
  onLocationUpdate,
  selectedLogisticFilter,
}: FranchiseOrdersTableBodyProps) {
  const visibleColumns = columns.filter((col) => col.visible);
  const isAllSelected =
    displayData.length > 0 &&
    displayData.every((item) => selectedOrderIds.includes(item.id));
  const isSomeSelected =
    displayData.some((item) => selectedOrderIds.includes(item.id)) &&
    !isAllSelected;

  return (
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
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getOrderStatusColor(
                          sale.order_status,
                        )}`}
                      >
                        {sale.order_status}
                      </span>
                    ) : column.id === "logistics_name" ? (
                      <div className="flex items-center min-w-[110px]">
                        {handleLogisticsChange ? (
                          <Select
                            value={normalizeLogisticsForSelect(sale.logistics)}
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
  );
}

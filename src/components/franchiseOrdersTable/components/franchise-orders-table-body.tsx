"use client";

import type React from "react";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Column, SaleItem } from "@/types/sale";
import { getOrderStatusColor } from "../utils/order-status";
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
    columnId: string
  ) => string | number | JSX.Element;
  onViewPaymentImage: (url: string) => void;
}

export function FranchiseOrdersTableBody({
  tableRef,
  columns,
  isLoading,
  displayData,
  currentPage,
  pageSize,
  getValueByColumnId,
  onViewPaymentImage,
}: FranchiseOrdersTableBodyProps) {
  const visibleColumns = columns.filter((col) => col.visible);

  return (
    <table
      ref={tableRef}
      className="w-full border-collapse whitespace-nowrap text-sm"
      style={{ minWidth: "100%" }}
    >
      <thead>
        <tr className="bg-gray-50">
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
          displayData.map((sale, index) => (
            <tr key={sale.id} className={index % 2 === 0 ? "" : "bg-gray-50"}>
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
                        sale.order_status
                      )}`}
                    >
                      {sale.order_status}
                    </span>
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
          ))
        ) : (
          <tr>
            <td
              colSpan={visibleColumns.length}
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

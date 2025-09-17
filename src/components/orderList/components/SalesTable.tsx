"use client";

import type React from "react";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableColumnHeader } from "./TableColumnHeader";
import { formatTimestamp } from "@/utils/formatters";
import type { SaleItem, SalesResponse, Column } from "@/types/sale";

interface SalesTableProps {
  columns: Column[];
  sales: SalesResponse | null;
  displayData: SaleItem[];
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onViewPaymentImage: (imageUrl: string) => void;
  onPageChange: (page: number) => void;
}

export function SalesTable({
  columns,
  sales,
  displayData,
  isLoading,
  currentPage,
  pageSize,
  onViewPaymentImage,
  onPageChange,
}: SalesTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const router = useRouter();

  // Function to handle sending order to WhatsApp
  const handleSendOrder = (sale: SaleItem, isDash: boolean) => {
    // Format the order details
    const orderDetails = `
*New Order Alert!* 🚀

*Customer Details:*
👤 Name: ${sale.full_name}
📱 Phone: ${sale.phone_number}
📱 AltPhone: ${sale.alternate_phone_number}
📍 Location: ${sale.delivery_address}, ${sale.city}


*Order Details:*
🛒 Products: ${sale.order_products
      .map((p) => `${p.product.name} - ${p.quantity}`)
      .join(", ")}
💰 Total Amount: Rs. ${sale.total_amount}
${
  sale.payment_method === "Prepaid"
    ? `💳 Prepaid Amount: Rs. ${sale.prepaid_amount || 0}
💰 Remaining Amount: Rs. ${
        Number(sale.total_amount) - (sale.prepaid_amount || 0)
      }`
    : ""
}

💳 Payment Method: ${sale.payment_method}
📝 Remarks: ${sale.remarks || "None"}

*Sales Person:*
👨‍💼 ${sale.sales_person.first_name} ${sale.sales_person.last_name}

Please process this order promptly! 🚀
    `.trim();

    const orderDetailsForDashGroup = `
*New Order Alert!* 🚀

*Customer Details:*
👤 Name: ${sale.full_name}
📱 Phone: ${sale.phone_number}
📱 AltPhone: ${sale.alternate_phone_number}
📍 Location: ${sale.delivery_address}, ${sale.city}

Tracking Code: ${sale.dash_tracking_code}
`.trim();

    // Copy to clipboard
    navigator.clipboard
      .writeText(isDash ? orderDetailsForDashGroup : orderDetails)
      .then(() => {
        // Show success message
        alert(
          "Order details copied to clipboard! Please paste it in your WhatsApp group."
        );
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy order details. Please try again.");
      });
  };

  // Add this function to handle edit
  const handleEdit = (sale: SaleItem) => {
    router.push(`/sales/orders/edit/${sale.id}`);
  };

  // Get value by column ID
  const getValueByColumnId = (sale: SaleItem, columnId: string) => {
    switch (columnId) {
      case "index":
        return "";
      case "timestamp":
        return formatTimestamp(sale.created_at);
      case "full_name":
        return (
          <>
            <span className="font-bold">{sale.full_name}</span>
            <br />
            {sale.logistics === "YDM" && (
              <a
                href={`https://ydm-logistics.vercel.app/track-order/${sale.order_code}`}
                target="_blank"
                className="hover:underline"
              >
                <span className="text-gray-500 text-sm cursor-pointer">
                  {sale.order_code}
                </span>
              </a>
            )}

            <br />
            <span className="text-gray-500 text-sm">
              {sale.dash_tracking_code}
            </span>
          </>
        );
      case "delivery_location":
        return `${sale.delivery_address}, ${sale.city}`;
      case "phone_number":
        return sale.phone_number;
      case "remarks":
        return sale.remarks;
      case "oil_type":
        return sale.order_products
          .map((product) => `${product.product.name} - ${product.quantity}`)
          .join(", ");
      case "quantity":
        let quantity = 0;
        sale.order_products.forEach((product) => {
          quantity += product.quantity;
        });
        return quantity;
      case "total_amount":
        return Number.parseFloat(sale.total_amount);
      case "remaining_amount":
        const total = Number.parseFloat(sale.total_amount);
        const prepaid = sale.prepaid_amount ?? 0;
        return total - prepaid;
      case "convinced_by":
        return `${sale.sales_person.first_name} ${sale.sales_person.last_name}`;
      case "payment_method":
        return (
          <div className="flex items-center gap-2">
            <span>
              {sale.payment_method}
              {sale.payment_method === "Prepaid" && sale.prepaid_amount && (
                <span className="ml-1 text-sm text-gray-500">
                  (Rs. {sale.prepaid_amount})
                </span>
              )}
            </span>
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
        );
      case "delivery_charge":
        return Number.parseFloat(sale.delivery_charge);

      case "send_order":
        return (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendOrder(sale, false)}
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Send Order
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendOrder(sale, true)}
              className="flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Send Order to Dash
            </Button>
          </>
        );
      case "edit":
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(sale)}
            className="flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </Button>
        );
      default:
        return "";
    }
  };

  return (
    <>
      <div className="overflow-x-auto border rounded-md h-[calc(100vh-180px)]">
        <Table
          ref={tableRef}
          className="border-collapse whitespace-nowrap text-sm"
        >
          <TableHeader>
            <tr className="bg-gray-50">
              {columns
                .filter((col) => col.visible)
                .map((column) => (
                  <TableColumnHeader key={column.id} column={column} />
                ))}
            </tr>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <TableCell
                        key={`skeleton-cell-${index}-${column.id}`}
                        className="border p-2"
                        style={{
                          width: `${column.width}px`,
                          minWidth: `${column.width}px`,
                        }}
                      >
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : sales && displayData.length > 0 ? (
              displayData.map((sale, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "" : "bg-gray-50"}
                >
                  {columns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <TableCell
                        key={`${index}-${column.id}`}
                        className="border p-2"
                        style={{
                          width: `${column.width}px`,
                          minWidth: `${column.width}px`,
                        }}
                      >
                        {column.id === "index" ? (
                          (currentPage - 1) * pageSize + index + 1
                        ) : column.id === "order_status" ? (
                          <div className="flex items-center">
                            {sale.order_status}
                          </div>
                        ) : (
                          getValueByColumnId(sale, column.id)
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.filter((col) => col.visible).length}
                  className="border p-2 text-center"
                >
                  No sales data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      {sales && (
        <div className="mt-4 flex flex-col md:flex-row justify-end items-center gap-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Page {currentPage} of {Math.ceil((sales.count || 0) / pageSize)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sales.next && onPageChange(currentPage + 1)}
              disabled={!sales.next}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

"use client";
import { Eye } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Column, SaleItem } from "@/types/sale";
import { JSX } from "react";
import { DashLocationCell } from "./DashLocationCell";

interface TableBodyProps {
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
  handleStatusChange: (saleId: string, newStatus: string) => void;
  handleEdit: (sale: SaleItem) => void;
  setSelectedPaymentImage: (url: string) => void;
  setShowPaymentImageModal: (show: boolean) => void;
  onLocationUpdate?: (
    saleId: number,
    location: { id: number; name: string }
  ) => void;
}

interface Logistics {
  id: number;
  name: string;
  phone_number: string | null;
}

export function TableBody({
  tableRef,
  columns,
  isLoading,
  displayData,
  currentPage,
  pageSize,
  getValueByColumnId,
  handleStatusChange,
  handleEdit,
  setSelectedPaymentImage,
  setShowPaymentImageModal,
  onLocationUpdate,
}: TableBodyProps) {
  const [logistics, setLogistics] = useState<Logistics[]>([]);
  const [isLoadingLogistics, setIsLoadingLogistics] = useState(true);

  // Fetch logistics options from the API
  useEffect(() => {
    const fetchLogistics = async () => {
      try {
        const response = await fetch(
          "https://sales.baliyoventures.com/api/account/logistics/",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch logistics");
        }
        const data = await response.json();
        setLogistics(data);
      } catch (error) {
        console.error("Error fetching logistics:", error);
      } finally {
        setIsLoadingLogistics(false);
      }
    };

    fetchLogistics();
  }, []);

  // Function to get color based on order status
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500"; // Green for delivered
      case "Pending":
        return "bg-yellow-500"; // Yellow for pending
      case "Cancelled":
        return "bg-red-500"; // Red for cancelled
      case "Returned By Customer":
        return "bg-blue-500"; // Blue for returned by customer
      case "Returned By Dash":
        return "bg-purple-500"; // Purple for returned by dash
      case "Return Pending":
        return "bg-orange-500"; // Orange for return pending
      default:
        return "bg-gray-500"; // Default color
    }
  };

  const handleLogisticsChange = async (saleId: string, logisticsId: string) => {
    try {
      // If logisticsId is 'none', set it to null
      const logisticsValue = logisticsId === "none" ? null : logisticsId;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sales/orders/${saleId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ logistics: logisticsValue }),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Logistics updated:", data);
          // Optionally, update the state or refetch data
        })
        .catch((error) => {
          console.error("Error updating logistics:", error);
        });
    } catch (error) {
      console.error("Error updating logistics:", error);
    }
  };

  return (
    <table
      ref={tableRef}
      className="w-full border-collapse whitespace-nowrap text-sm"
      style={{ minWidth: "100%" }}
    >
      <thead>
        <tr className="bg-gray-50">
          {columns
            .filter((col) => col.visible)
            .map((column) => (
              <th
                key={column.id}
                className="border p-2 text-left relative"
                style={{
                  width: `${column.width}px`,
                  minWidth: `${column.width}px`,
                }}
              >
                <span>{column.label}</span>
              </th>
            ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <tr key={`skeleton-${index}`}>
              {columns
                .filter((col) => col.visible)
                .map((column) => (
                  <td
                    key={`skeleton-cell-${index}-${column.id}`}
                    className="border p-2"
                    style={{
                      width: `${column.width}px`,
                      minWidth: `${column.width}px`,
                    }}
                  >
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
            </tr>
          ))
        ) : displayData.length > 0 ? (
          displayData.map((sale, index) => (
            <tr key={sale.id} className={index % 2 === 0 ? "" : "bg-gray-50"}>
              {columns
                .filter((col) => col.visible)
                .map((column) => (
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
                      <div className="flex items-center">
                        <Select
                          value={sale.order_status}
                          onValueChange={(value) =>
                            handleStatusChange(String(sale.id), value)
                          }
                        >
                          <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                            <SelectItem value="Pending">
                              <span
                                className={
                                  getOrderStatusColor("Pending") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Pending
                            </SelectItem>
                            <SelectItem value="Processing">
                              <span
                                className={
                                  getOrderStatusColor("Processing") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Processing
                            </SelectItem>
                            <SelectItem value="Sent to Dash">
                              <span
                                className={
                                  getOrderStatusColor("Sent to Dash") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Sent to Dash
                            </SelectItem>
                            <SelectItem value="Indrive">
                              <span
                                className={
                                  getOrderStatusColor("Indrive") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Indrive
                            </SelectItem>
                            <SelectItem value="Delivered">
                              <span
                                className={
                                  getOrderStatusColor("Delivered") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Delivered
                            </SelectItem>
                            <SelectItem value="Cancelled">
                              <span
                                className={
                                  getOrderStatusColor("Cancelled") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Cancelled
                            </SelectItem>
                            <SelectItem value="Returned By Customer">
                              <span
                                className={
                                  getOrderStatusColor("Returned By Customer") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Returned By Customer
                            </SelectItem>
                            <SelectItem value="Returned By Dash">
                              <span
                                className={
                                  getOrderStatusColor("Returned By Dash") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Returned By Dash
                            </SelectItem>
                            <SelectItem value="Return Pending">
                              <span
                                className={
                                  getOrderStatusColor("Return Pending") +
                                  " rounded-full w-4 h-4 inline-block mr-2"
                                }
                              ></span>
                              Return Pending
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : column.id === "logistics_name" ? (
                      <div className="flex items-center">
                        <Select
                          value={
                            sale.logistics_name
                              ? logistics
                                  .find((l) => l.name === sale.logistics_name)
                                  ?.id.toString()
                              : ""
                          }
                          onValueChange={(value) =>
                            handleLogisticsChange(String(sale.id), value)
                          }
                        >
                          <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300">
                            <SelectValue placeholder="Change Logistics" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                            {isLoadingLogistics ? (
                              <SelectItem value="id">Loading...</SelectItem>
                            ) : (
                              <>
                                <SelectItem value="none">
                                  Change Logistic
                                </SelectItem>
                                {logistics.map((logistic) => (
                                  <SelectItem
                                    key={logistic.id}
                                    value={logistic.id.toString() || "default"} // Ensure value is not an empty string
                                  >
                                    {logistic.name || "Unnamed Logistic"}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
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
                          sale.payment_method === "Office Visit") &&
                          sale.payment_screenshot && (
                            <Eye
                              className="h-4 w-4 cursor-pointer text-gray-500 hover:text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPaymentImage(
                                  sale.payment_screenshot
                                );
                                setShowPaymentImageModal(true);
                              }}
                            />
                          )}
                      </div>
                    ) : column.id === "delivery_location" ? (
                      <div className="whitespace-normal break-words">
                        {getValueByColumnId(sale, column.id)}
                      </div>
                    ) : column.id === "edit" ? (
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
                    ) : column.id === "product_sold" ? (
                      <div className="whitespace-normal break-words">
                        {sale.order_products.map((item, idx) => (
                          <div key={item.id || idx}>
                            {item.product.name} - {item.quantity}
                          </div>
                        ))}
                      </div>
                    ) : column.id === "dash_location_name" ? (
                      <DashLocationCell
                        key={`${sale.id}-${sale.dash_location_name || ""}`}
                        sale={sale}
                        onLocationUpdate={onLocationUpdate}
                      />
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
              colSpan={columns.filter((col) => col.visible).length}
              className="border p-2 text-center"
            >
              No sales data found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

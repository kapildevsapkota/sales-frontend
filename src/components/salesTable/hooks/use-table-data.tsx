"use client";
import { useState, useCallback, JSX } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SaleItem, SortDirection } from "@/types/sale";

export function useTableData() {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Format timestamp helper function
  const formatTimestamp = (dateString: string): JSX.Element => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return <>Invalid date</>;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <>
        {day}/{month}/{year}
        <br />
        {time}
      </>
    );
  };

  // Get value by column ID
  const getValueByColumnId = useCallback(
    (sale: SaleItem, columnId: string): string | number | JSX.Element => {
      switch (columnId) {
        case "index":
          return "";
        case "timestamp":
          return formatTimestamp(sale.created_at);
        case "full_name":
          return (
            <>
              {sale.full_name}
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
                  <br />
                </a>
              )}
              {sale.dash_tracking_code}
            </>
          );
        case "dash_location_name":
          return sale.dash_location_name || "N/A";
        case "delivery_location":
          return `${sale.delivery_address}, ${sale.city}`;
        case "phone_number":
          return sale.phone_number;
        case "alternate_phone_number":
          return sale.alternate_phone_number || "N/A";
        case "remarks":
          return sale.remarks;
        case "product_sold":
          return sale.order_products
            .map((item) => `${item.product.name} - ${item.quantity}`)
            .join(", ");
        case "total_amount":
          return `Rs. ${Number.parseFloat(sale.total_amount).toLocaleString()}`;
        case "remaining_amount":
          const total = Number.parseFloat(sale.total_amount);
          const prepaid = sale.prepaid_amount ?? 0;
          return `Rs. ${(total - prepaid).toLocaleString()}`;
        case "convinced_by":
          return `${sale.sales_person.first_name} ${sale.sales_person.last_name}`;
        case "payment_method":
          return sale.payment_method;
        case "delivery_charge":
          return `Rs. ${Number.parseFloat(
            sale.delivery_charge
          ).toLocaleString()}`;
        case "delivery_type":
          return sale.delivery_type;
        case "logistics_name":
          return sale.logistics_name as string;
        case "order_status":
          return sale.order_status;
        default:
          return "";
      }
    },
    []
  );

  // Handle sort change
  const handleSort = useCallback(
    (columnId: string) => {
      if (columnId === sortField) {
        // Toggle direction if same field
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else if (sortDirection === "desc") {
          setSortField(null);
          setSortDirection(null);
        } else {
          setSortDirection("asc");
        }
      } else {
        // New field, set to ascending
        setSortField(columnId);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  // Sort data function
  const sortData = useCallback(
    (data: SaleItem[], field: string | null, direction: SortDirection) => {
      if (!field || !direction) return data;

      return [...data].sort((a, b) => {
        let valueA = getValueByColumnId(a, field);
        let valueB = getValueByColumnId(b, field);

        // Handle numeric values
        if (typeof valueA === "number" && typeof valueB === "number") {
          return direction === "asc" ? valueA - valueB : valueB - valueA;
        }
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
        if (valueA < valueB) return direction === "asc" ? -1 : 1;
        if (valueA > valueB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    },
    [getValueByColumnId]
  );

  // Get sort icon based on current sort state
  const getSortIcon = useCallback(
    (columnId: string) => {
      if (sortField !== columnId)
        return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
      if (sortDirection === "asc") return <ArrowUp className="h-4 w-4 ml-1" />;
      if (sortDirection === "desc")
        return <ArrowDown className="h-4 w-4 ml-1" />;
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    },
    [sortField, sortDirection]
  );

  return {
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    handleSort,
    sortData,
    getValueByColumnId,
    getSortIcon,
  };
}

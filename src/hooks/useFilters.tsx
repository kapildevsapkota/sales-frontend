"use client";

import { useState, useCallback } from "react";

import type { SaleItem } from "@/types/sale";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useFilters(fetchSales: (page: number) => Promise<void>) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [exportDateRange, setExportDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);

  const getValueByColumnId = (item: SaleItem, key: string) => {
    switch (key) {
      case "full_name":
        return item.full_name;
      case "delivery_location":
        return `${item.delivery_address}, ${item.city}`;
      case "phone_number":
        return item.phone_number;
      case "remarks":
        return item.remarks || "";
      case "convinced_by":
        return `${item.sales_person.first_name} ${item.sales_person.last_name}`;
      case "total_amount":
        return Number.parseFloat(item.total_amount);
      case "remaining_amount":
        const total = Number.parseFloat(item.total_amount);
        const prepaid = item.prepaid_amount ?? 0;
        return total - prepaid;
      case "delivery_charge":
        return Number.parseFloat(item.delivery_charge);
      default:
        return "";
    }
  };

  // Function to apply filters to the data
  const applyFilters = useCallback(
    (data: SaleItem[]) => {
      if (Object.keys(filters).length === 0 && !dateRange[0] && !dateRange[1])
        return data;

      return data.filter((item) => {
        // Apply date range filter
        if (dateRange[0] && dateRange[1]) {
          const saleDate = new Date(item.created_at);
          if (saleDate < dateRange[0] || saleDate > dateRange[1]) {
            return false;
          }
        }

        // Apply other filters
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;

          // Handle total amount range filtering
          if (key === "total_amount_min") {
            return Number(item.total_amount) >= Number(value);
          }
          if (key === "total_amount_max") {
            return Number(item.total_amount) <= Number(value);
          }

          // Handle oil type filtering
          if (key === "oil_type") {
            const oilType = item.order_products[0]?.product.name || "";
            return oilType.toLowerCase().includes(value.toLowerCase());
          }

          // Handle quantity filtering
          if (key === "quantity") {
            const quantity = item.order_products[0]?.quantity || 0;
            return quantity === Number(value);
          }

          // Handle status filtering
          if (key === "order_status") {
            return item.order_status === value;
          }

          // Handle other filters
          const itemValue = String(getValueByColumnId(item, key)).toLowerCase();
          return itemValue.includes(value.toLowerCase());
        });
      });
    },
    [filters, dateRange]
  );

  const handleAdvancedFilter = async () => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add date range filters if selected
      if (dateRange[0] && dateRange[1]) {
        queryParams.append(
          "start_date",
          dateRange[0].toISOString().split("T")[0]
        );
        queryParams.append(
          "end_date",
          dateRange[1].toISOString().split("T")[0]
        );
      }

      // Add status filter if selected
      if (filters["order_status"]) {
        queryParams.append("order_status", filters["order_status"]);
      }

      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "order_status") {
          queryParams.append(key, value);
        }
      });

      // This would need to be handled via callbacks to the parent component
      // setSales(response.data);
      // setCurrentPage(1);
      // setDisplayData(response.data.results || []); // Update displayData with filtered results

      // For now, just refetch the data
      fetchSales(1);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  return {
    filters,
    setFilters,
    dateRange,
    setDateRange,
    exportDateRange,
    setExportDateRange,
    handleAdvancedFilter,
    applyFilters,
  };
}

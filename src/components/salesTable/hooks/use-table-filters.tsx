"use client";
import { useState, useCallback } from "react";
import type { SaleItem } from "@/types/sale";

export function useTableFilters() {
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [exportDateRange, setExportDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);

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

          // Handle oil type filtering - now checks all products
          if (key === "oil_type") {
            return item.order_products.some((product) =>
              product.product.name.toLowerCase().includes(value.toLowerCase())
            );
          }

          // Handle quantity filtering - now checks all products
          if (key === "quantity") {
            return item.order_products.some(
              (product) => product.quantity === Number(value)
            );
          }

          // Handle status filtering
          if (key === "order_status") {
            return item.order_status === value;
          }

          // Handle other filters
          const itemValue = String(
            item[key as keyof SaleItem] || ""
          ).toLowerCase();
          return itemValue.includes(value.toLowerCase());
        });
      });
    },
    [filters, dateRange]
  );

  // Update the handleAdvancedFilter function to use the correct API endpoint
  const handleAdvancedFilter = useCallback(async () => {
    // This is just a placeholder - the actual implementation will be in the main component
    // The main component will use api/orders/ instead of api/sales/orders/
    return Promise.resolve();
  }, []);

  return {
    showFilterForm,
    setShowFilterForm,
    filters,
    setFilters,
    dateRange,
    setDateRange,
    exportDateRange,
    setExportDateRange,
    applyFilters,
    handleAdvancedFilter,
  };
}

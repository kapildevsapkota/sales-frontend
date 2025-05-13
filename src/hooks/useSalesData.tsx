"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import type { SaleItem, SalesResponse } from "@/types/sale";

export function useSalesData() {
  const [sales, setSales] = useState<SalesResponse | null>(null);
  const [displayData, setDisplayData] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterTerm, setFilterTerm] = useState("");

  // Function to show error messages
  const showError = useCallback((message: string) => {
    console.error(message);
    // You can implement a toast notification here
  }, []);

  // Fetch sales data from API
  const fetchSales = useCallback(
    async (page = 1, size: number = pageSize) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");

        // Add sorting parameters to API request if supported by backend
        const url = `${
          process.env.NEXT_PUBLIC_API_URL
        }api/sales/orders/?page=${page}&page_size=${size}&search=${encodeURIComponent(
          filterTerm
        )}`;

        const response = await axios.get<SalesResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSales(response.data);
        setDisplayData(response.data.results || []);
        setCurrentPage(page);
        setPageSize(size);
      } catch {
        showError("Failed to fetch sales data");
      } finally {
        setIsLoading(false);
      }
    },
    [filterTerm, pageSize, showError]
  );

  return {
    sales,
    setSales, // Add this line
    displayData,
    setDisplayData,
    isLoading,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchSales,
    filterTerm,
    setFilterTerm,
  };
}

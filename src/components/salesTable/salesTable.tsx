"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type React from "react";

import axios from "axios";
import { useRouter } from "next/navigation";
import type { SaleItem, SalesResponse } from "@/types/sale";
import { TableHeader } from "./components/table-header";
import { TableBody } from "./components/table-body";
import { TablePagination } from "./components/table-pagination";
import { ExportModal } from "./components/export-modal";
import { PaymentImageModal } from "./components/payment-image-modal";
import { useTableColumns } from "./hooks/use-table-columns";
import { useTableData } from "./hooks/use-table-data";
import { useTableFilters } from "./hooks/use-table-filters";

export default function SalesTable() {
  const [sales, setSales] = useState<SalesResponse | null>(null);
  const [displayData, setDisplayData] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterTerm, setFilterTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState<string>("");
  const router = useRouter();
  const tableRef = useRef<HTMLTableElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Custom hooks
  const {
    columns,

    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
    handleResizeStart,
  } = useTableColumns();

  const {
    sortField,
    sortDirection,

    handleSort,
    sortData,
    getValueByColumnId,
    getSortIcon,
  } = useTableData();

  const {
    showFilterForm,
    setShowFilterForm,

    exportDateRange,
    setExportDateRange,
    applyFilters,
  } = useTableFilters();

  // Function to show error messages
  const showError = useCallback((message: string) => {
    console.error(message);
  }, []);

  const fetchSales = useCallback(
    async (page = 1, size: number = pageSize) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");

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
        setCurrentPage(page);
        setPageSize(size);

        applyFilters(response.data.results || []);
      } catch {
        showError("Failed to fetch sales data");
      } finally {
        setIsLoading(false);
      }
    },
    [filterTerm, pageSize, applyFilters, showError]
  );

  // Update the handleGlobalSearch function
  const handleGlobalSearch = useCallback(
    (searchTerm: string) => {
      if (!sales?.results) return;

      const filtered = sales.results.filter((sale) => {
        const searchableFields = [
          sale.full_name,
          sale.delivery_address,
          sale.city,
          sale.phone_number,
          sale.remarks,
          sale.order_products[0]?.product.name,
          sale.payment_method,
          `${sale.sales_person.first_name} ${sale.sales_person.last_name}`,
          sale.total_amount.toString(),
        ];

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

      setDisplayData(filtered);
    },
    [sales]
  );

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        if (value.length >= 3) {
          // If search term is 3 or more characters, fetch from API
          setFilterTerm(value);
          fetchSales(1);
        } else if (value.length === 0) {
          // If search is cleared, reset to original data
          setFilterTerm("");
          fetchSales(1);
        } else {
          // For 1-2 characters, just filter the current data
          handleGlobalSearch(value);
        }
      }, 300);
    },
    [fetchSales, handleGlobalSearch]
  );

  // Update the sorting effect
  useEffect(() => {
    if (sales?.results) {
      let dataToSort = [...sales.results];

      // Apply search filter if there's a search term
      if (searchInput && searchInput.length < 3) {
        dataToSort = dataToSort.filter((sale) => {
          const searchableFields = [
            sale.full_name,
            sale.delivery_address,
            sale.city,
            sale.phone_number,
            sale.remarks,
            sale.order_products[0]?.product.name,
            sale.payment_method,
            `${sale.sales_person.first_name} ${sale.sales_person.last_name}`,
            sale.total_amount.toString(),
          ];

          return searchableFields.some((field) =>
            field?.toLowerCase().includes(searchInput.toLowerCase())
          );
        });
      }

      // Apply filters
      const filtered = applyFilters(dataToSort);

      // Apply sorting
      const sorted = sortData(filtered, sortField, sortDirection);
      setDisplayData(sorted);
    }
  }, [sales, sortField, sortDirection, sortData, searchInput, applyFilters]);

  // Load initial data
  useEffect(() => {
    fetchSales(currentPage);
  }, [fetchSales, currentPage]);

  // Add this function to handle edit
  const handleEdit = (sale: SaleItem) => {
    router.push(`/sales/orders/edit/${sale.id}`);
  };

  // Add this function to handle status change
  const handleStatusChange = async (saleId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${process.env.NEXT_PUBLIC_API_URL}api/sales/orders/${saleId}/`;

      await axios.patch(
        url,
        { order_status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchSales(currentPage);
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Failed to update order status");
    }
  };

  // Function to handle CSV export
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const url = `https://sales.baliyoventures.com/api/sales/export-csv`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for downloading files
      });

      // Create a link element to trigger the download
      const urlObject = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlObject;
      link.setAttribute("download", `sales_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportModal(false);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  return (
    <div className="container-fluid px-2 py-2">
      {/* Header Section */}
      <TableHeader
        columns={columns}
        toggleColumnVisibility={toggleColumnVisibility}
        showAllColumns={showAllColumns}
        hideAllColumns={hideAllColumns}
        salesCount={sales?.count || 0}
        resultsCount={sales?.results.length || 0}
        searchInput={searchInput}
        handleSearchInputChange={handleSearchInputChange}
        setSearchInput={setSearchInput}
        setFilterTerm={setFilterTerm}
        fetchSales={fetchSales}
        showFilterForm={showFilterForm}
        setShowFilterForm={setShowFilterForm}
        setShowExportModal={setShowExportModal}
      />

      {/* Filters */}

      {showExportModal && (
        <ExportModal
          exportDateRange={exportDateRange}
          setExportDateRange={setExportDateRange}
          handleExportCSV={handleExportCSV}
          setShowExportModal={setShowExportModal}
        />
      )}

      {/* Payment Image Modal */}
      {showPaymentImageModal && (
        <PaymentImageModal
          selectedPaymentImage={selectedPaymentImage}
          setShowPaymentImageModal={setShowPaymentImageModal}
        />
      )}

      <div className="overflow-x-auto border rounded-md h-[calc(100vh-180px)]">
        <TableBody
          tableRef={tableRef as React.RefObject<HTMLTableElement>}
          columns={columns}
          isLoading={isLoading}
          displayData={displayData}
          currentPage={currentPage}
          pageSize={pageSize}
          handleSort={handleSort}
          getSortIcon={getSortIcon}
          handleResizeStart={handleResizeStart}
          getValueByColumnId={getValueByColumnId}
          handleStatusChange={handleStatusChange}
          handleEdit={handleEdit}
          setSelectedPaymentImage={setSelectedPaymentImage}
          setShowPaymentImageModal={setShowPaymentImageModal}
        />
      </div>

      {sales && (
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={sales.count || 0}
          hasNext={!!sales.next}
          fetchSales={fetchSales}
        />
      )}
    </div>
  );
}

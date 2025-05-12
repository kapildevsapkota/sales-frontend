"use client";

import type React from "react";

import { useRef } from "react";

import { useState, useEffect, useCallback } from "react";
import { SalesTable } from "./components/SalesTable";
import { SearchBar } from "./components/SearchBar";
import { ColumnSelector } from "./components/ColumnSelector";
import { FilterForm } from "./components/FilterForm";
import { ExportModal } from "./components/ExportModal";
import { PaymentImageModal } from "./components/PaymentImageModal";
import { Button } from "@/components/ui/button";
import { useColumns } from "@/hooks/useColumns";
import { useSalesData } from "@/hooks/useSalesData";
import { useFilters } from "@/hooks/useFilters";

export default function OrderList() {
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const {
    columns,

    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
  } = useColumns();

  const {
    sales,
    displayData,
    isLoading,
    currentPage,
    pageSize,

    fetchSales,
    setDisplayData,

    setFilterTerm,
  } = useSalesData();

  const {
    filters,
    setFilters,
    dateRange,
    setDateRange,
    exportDateRange,
    setExportDateRange,
    handleAdvancedFilter,
  } = useFilters(fetchSales);

  // Handle search input change
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
    [fetchSales, setFilterTerm]
  );

  // Global search function
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
    [sales, setDisplayData]
  );

  // Handle payment image view
  const handleViewPaymentImage = (imageUrl: string) => {
    setSelectedPaymentImage(imageUrl);
    setShowPaymentImageModal(true);
  };

  // Load initial data
  useEffect(() => {
    fetchSales(currentPage);
  }, [fetchSales, currentPage]);

  return (
    <div className="container-fluid px-2 py-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-normal">
            <ColumnSelector
              columns={columns}
              toggleColumnVisibility={toggleColumnVisibility}
              showAllColumns={showAllColumns}
              hideAllColumns={hideAllColumns}
            />
            <div className="text-xs text-gray-500 whitespace-nowrap">
              {sales?.results.length
                ? `${sales.results.length} of ${sales.count} entries`
                : ""}
            </div>
          </div>

          <SearchBar
            searchInput={searchInput}
            handleSearchInputChange={handleSearchInputChange}
            clearSearch={() => {
              setSearchInput("");
              setFilterTerm("");
              fetchSales(1);
            }}
            toggleFilterForm={() => setShowFilterForm(!showFilterForm)}
          />

          {showFilterForm && (
            <FilterForm
              filters={filters}
              setFilters={setFilters}
              dateRange={dateRange}
              setDateRange={setDateRange}
              columns={columns}
              onApply={() => {
                handleAdvancedFilter();
                setShowFilterForm(false);
              }}
              onClear={() => {
                setFilters({});
                setDateRange([undefined, undefined]);
                fetchSales(1);
                setShowFilterForm(false);
              }}
              onClose={() => setShowFilterForm(false)}
            />
          )}
        </div>

        {/* Export CSV Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-normal">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 whitespace-nowrap"
            onClick={() => setShowExportModal(true)}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Export CSV Modal */}
      {showExportModal && (
        <ExportModal
          exportDateRange={exportDateRange}
          setExportDateRange={setExportDateRange}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Payment Image Modal */}
      {showPaymentImageModal && (
        <PaymentImageModal
          imageUrl={selectedPaymentImage}
          onClose={() => setShowPaymentImageModal(false)}
        />
      )}

      {/* Table Section */}
      <SalesTable
        columns={columns}
        sales={sales}
        displayData={displayData}
        isLoading={isLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        onViewPaymentImage={handleViewPaymentImage}
        onPageChange={(page) => fetchSales(page)}
      />
    </div>
  );
}

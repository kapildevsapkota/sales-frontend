"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { SalesTable } from "@/components/orderList/components/SalesTable";
import { SearchBar } from "@/components/orderList/components/SearchBar";
import { ColumnSelector } from "@/components/orderList/components/ColumnSelector";
import { ExportModal } from "@/components/orderList/components/ExportModal";
import { PaymentImageModal } from "@/components/orderList/components/PaymentImageModal";
import { Button } from "@/components/ui/button";
import { useColumns } from "@/hooks/useColumns";
import { useSalesData } from "@/hooks/useSalesData";
import type { SalesResponse } from "@/types/sale";
import type { DateRange } from "react-day-picker";

export default function OrderList() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  // Define the dateRange state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [exportDateRange, setExportDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);

  const { columns, toggleColumnVisibility, showAllColumns, hideAllColumns } =
    useColumns();

  const {
    sales,
    displayData,
    isLoading,
    currentPage,
    pageSize,
    fetchSales,
    setFilterTerm,
    setSales,
    setDisplayData,
  } = useSalesData();

  // Handle search input change
  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);

      // If search is cleared, reset to original data
      if (value.length === 0 && paymentMethod === "all" && !dateRange) {
        setFilterTerm("");
        fetchSales(1);
      }
      // For backend search, we'll let the SearchBar component handle the API call
    },
    [fetchSales, setFilterTerm, paymentMethod, dateRange]
  );

  // Handle search results from backend
  const handleSearchResults = useCallback(
    (data: SalesResponse) => {
      if (data && data.results) {
        setDisplayData(data.results);

        if (data.count !== undefined) {
          setSales((prevSales: SalesResponse | null) =>
            prevSales
              ? {
                  ...prevSales,
                  results: data.results,
                  count: data.count,
                  next: data.next,
                  previous: data.previous,
                }
              : null
          );
        }
      }
    },
    [setDisplayData, setSales]
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

          <div className="w-full">
            <SearchBar
              searchInput={searchInput}
              handleSearchInputChange={handleSearchInputChange}
              clearSearch={() => {
                setSearchInput("");
                setFilterTerm("");
                fetchSales(1);
              }}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onSearchResults={handleSearchResults}
            />
          </div>
        </div>

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

      {showPaymentImageModal && (
        <PaymentImageModal
          imageUrl={selectedPaymentImage}
          onClose={() => setShowPaymentImageModal(false)}
        />
      )}

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

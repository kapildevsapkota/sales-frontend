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
import { DateRange } from "react-day-picker";
import { api } from "@/lib/api";
import { ErrorDialog } from "@/components/ErrorDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function SalesTable() {
  const [sales, setSales] = useState<SalesResponse | null>(null);
  const [displayData, setDisplayData] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterTerm, setFilterTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [deliveryType, setDeliveryType] = useState("all");
  const [logistic, setLogistic] = useState("all");
  const [salesperson, setSalesperson] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState<string>("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");
  const router = useRouter();
  const tableRef = useRef<HTMLTableElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const { user } = useAuth();

  // Custom hooks
  const { columns, toggleColumnVisibility, showAllColumns, hideAllColumns } =
    useTableColumns();

  const { getValueByColumnId } = useTableData();

  const {
    showFilterForm,
    setShowFilterForm,
    exportDateRange,
    setExportDateRange,
    applyFilters,
  } = useTableFilters();

  // Function to show error messages
  const showError = useCallback((message: string) => {
    console.log("showError called with:", message);
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
  }, []);

  const fetchSales = useCallback(
    async (page = 1, size: number = pageSize) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");

        // Build URL with search and filters
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales/orders/?page=${page}&page_size=${size}`;

        // Add search parameter if present
        if (filterTerm) {
          url += `&search=${encodeURIComponent(filterTerm)}`;
        }

        // Add payment_method parameter if selected
        if (paymentMethod && paymentMethod !== "all") {
          url += `&payment_method=${encodeURIComponent(paymentMethod)}`;
        }

        // Add order_status parameter if selected
        if (orderStatus && orderStatus !== "all") {
          url += `&order_status=${encodeURIComponent(orderStatus)}`;
        }

        // Add delivery_type parameter if selected
        if (deliveryType && deliveryType !== "all") {
          url += `&delivery_type=${encodeURIComponent(deliveryType)}`;
        }

        // Add salesperson parameter if selected
        if (salesperson && salesperson !== "all") {
          url += `&sales_person=${encodeURIComponent(salesperson)}`;
        }

        // Add logistic parameter if selected and user is Packaging
        if (logistic && logistic !== "all" && user?.role === "Packaging") {
          url += `&logistics=${encodeURIComponent(logistic)}`;
        }

        const formatDate = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        if (dateRange?.from) {
          url += `&start_date=${formatDate(dateRange.from)}`;
        }

        if (dateRange?.to) {
          url += `&end_date=${formatDate(dateRange.to)}`;
        }

        const response = await axios.get<SalesResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSales(response.data);
        setCurrentPage(page);
        setPageSize(size);

        applyFilters(response.data.results || []);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        showError("Failed to fetch sales data");
      } finally {
        setIsLoading(false);
      }
    },
    [
      filterTerm,
      pageSize,
      applyFilters,
      showError,
      paymentMethod,
      orderStatus,
      deliveryType,
      logistic,
      dateRange,
      user,
      salesperson,
    ]
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

      // Apply client-side filters for 1-2 character searches
      if (
        paymentMethod &&
        paymentMethod !== "all" &&
        searchInput &&
        searchInput.length < 3
      ) {
        dataToSort = dataToSort.filter(
          (sale) => sale.payment_method === paymentMethod
        );
      }

      if (
        orderStatus &&
        orderStatus !== "all" &&
        searchInput &&
        searchInput.length < 3
      ) {
        dataToSort = dataToSort.filter(
          (sale) => sale.order_status === orderStatus
        );
      }

      if (
        deliveryType &&
        deliveryType !== "all" &&
        searchInput &&
        searchInput.length < 3
      ) {
        dataToSort = dataToSort.filter(
          (sale) => sale.delivery_type === deliveryType
        );
      }

      if (
        salesperson &&
        salesperson !== "all" &&
        searchInput &&
        searchInput.length < 3
      ) {
        dataToSort = dataToSort.filter(
          (sale) => sale.sales_person.id.toString() === salesperson
        );
      }

      // Apply filters
      const filtered = applyFilters(dataToSort);

      setDisplayData(filtered);
    }
  }, [
    sales,
    searchInput,
    applyFilters,
    paymentMethod,
    orderStatus,
    deliveryType,
    logistic,
    salesperson,
  ]);

  useEffect(() => {
    fetchSales(currentPage);
  }, [fetchSales, currentPage]);

  // Add this function to handle edit
  const handleEdit = (sale: SaleItem) => {
    router.push(`/sales/orders/edit/${sale.id}`);
  };

  const handleStatusChange = async (saleId: string, newStatus: string) => {
    try {
      await api
        .patch(`/api/sales/orders/${saleId}/`, { order_status: newStatus })
        .then(() => {
          setDisplayData((prevData) =>
            prevData.map((sale) =>
              sale.id.toString() === saleId
                ? { ...sale, order_status: newStatus }
                : sale
            )
          );
          setSales((prevSales) => {
            if (!prevSales) return prevSales;
            return {
              ...prevSales,
              results: prevSales.results.map((sale) =>
                sale.id.toString() === saleId
                  ? { ...sale, order_status: newStatus }
                  : sale
              ),
            };
          });
        })
        .catch((err) => {
          console.log(err);
          showError("Failed to update order status");
        });
    } catch (error) {
      console.error("Error updating order status:", error);
      showError("Failed to update order status");
    }
  };

  // Handle location update for a sale
  const handleLocationUpdate = (
    saleId: number,
    location: { id: number; name: string }
  ) => {
    setDisplayData((prevData) =>
      prevData.map((sale) =>
        sale.id === saleId
          ? {
              ...sale,
              dash_location_id: location.id,
              dash_location_name: location.name,
            }
          : sale
      )
    );
    setSales((prevSales) => {
      if (!prevSales) return prevSales;
      return {
        ...prevSales,
        results: prevSales.results.map((sale) =>
          sale.id === saleId
            ? {
                ...sale,
                dash_location_id: location.id,
                dash_location_name: location.name,
              }
            : sale
        ),
      };
    });
  };

  // Updated handleExportCSV function in your main SalesTable component

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // Build the URL with query parameters
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales/export-csv/`;

      // If user is Packaging role and a specific logistic is selected, add logistics query parameter
      if (user?.role === "Packaging" && logistic && logistic !== "all") {
        url += `?logistics=${logistic}`;
      }

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

      // Update filename to include logistic name if specific logistic is selected
      let filename = "sales_export.csv";
      if (user?.role === "Packaging" && logistic && logistic !== "all") {
        // You might want to get the logistic name for the filename
        filename = `sales_export_logistic_${logistic}.csv`;
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportModal(false);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      showError("Failed to export CSV. Please try again.");
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen px-2 py-2">
      {/* Header Section */}
      <TableHeader
        className="sticky top-[64px] z-10 py-2 bg-white"
        columns={columns}
        toggleColumnVisibility={toggleColumnVisibility}
        showAllColumns={showAllColumns}
        hideAllColumns={hideAllColumns}
        salesCount={sales?.count || 0}
        resultsCount={sales?.results?.length || 0}
        searchInput={searchInput}
        handleSearchInputChange={handleSearchInputChange}
        setSearchInput={setSearchInput}
        setFilterTerm={setFilterTerm}
        fetchSales={fetchSales}
        showFilterForm={showFilterForm}
        setShowFilterForm={setShowFilterForm}
        setShowExportModal={setShowExportModal}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        orderStatus={orderStatus}
        setOrderStatus={setOrderStatus}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        logistic={logistic}
        setLogistic={setLogistic}
        dateRange={dateRange}
        setDateRange={setDateRange}
        sales={sales?.results || []}
        salesperson={salesperson}
        setSalesperson={setSalesperson}
      />

      {showExportModal && (
        <ExportModal
          open={showExportModal}
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

      {/* Table body should take all available space and be scrollable */}
      <div className="flex-1 overflow-auto border rounded-md my-2">
        <TableBody
          tableRef={tableRef as React.RefObject<HTMLTableElement>}
          columns={columns}
          isLoading={isLoading}
          displayData={displayData}
          currentPage={currentPage}
          pageSize={pageSize}
          getValueByColumnId={getValueByColumnId}
          handleStatusChange={handleStatusChange}
          handleEdit={handleEdit}
          setSelectedPaymentImage={setSelectedPaymentImage}
          setShowPaymentImageModal={setShowPaymentImageModal}
          onLocationUpdate={handleLocationUpdate}
        />
      </div>

      {/* Pagination pinned to the bottom */}
      {sales && (
        <div className="sticky bottom-0 z-10 bg-white mt-2 border-t border-gray-200">
          <TablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={sales.count || 0}
            hasNext={!!sales.next}
            fetchSales={fetchSales}
          />
        </div>
      )}

      {/* Error Dialog */}
      <ErrorDialog
        open={errorDialogOpen}
        message={errorDialogMessage}
        onClose={() => setErrorDialogOpen(false)}
      />
    </div>
  );
}

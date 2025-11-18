"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type React from "react";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const tableRef = useRef<HTMLTableElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const { user } = useAuth();

  // Custom hooks
  const { columns, toggleColumnVisibility, showAllColumns, hideAllColumns } =
    useTableColumns();

  const { getValueByColumnId } = useTableData();

  const { showFilterForm, setShowFilterForm, applyFilters } = useTableFilters();

  // Franchise export date range state
  const [franchiseExportDateRange, setFranchiseExportDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);

  // Persisted bulk order filter via query params
  const [isBulkOrderOnly, setIsBulkOrderOnly] = useState<boolean>(false);
  const [rawIsBulkOrderQuery, setRawIsBulkOrderQuery] = useState<string | null>(
    null
  );
  const [initializedFromQuery, setInitializedFromQuery] =
    useState<boolean>(false);

  // Export filters (advanced) state
  const [totalAmountMin, setTotalAmountMin] = useState<number | undefined>(
    undefined
  );
  const [totalAmountMax, setTotalAmountMax] = useState<number | undefined>(
    undefined
  );
  const [productsCountMin, setProductsCountMin] = useState<number | undefined>(
    undefined
  );
  const [productsCountMax, setProductsCountMax] = useState<number | undefined>(
    undefined
  );
  const [moreThan3Products, setMoreThan3Products] = useState<
    boolean | undefined
  >(undefined);
  const [multipleOrdersCustomer, setMultipleOrdersCustomer] = useState<
    boolean | undefined
  >(undefined);
  const [oilBottleTotalMin, setOilBottleTotalMin] = useState<
    number | undefined
  >(undefined);
  const [oilBottleOnly, setOilBottleOnly] = useState<boolean | undefined>(
    undefined
  );

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
        if (
          logistic &&
          logistic !== "all" &&
          (user?.role === "Packaging" || user?.role === "Franchise")
        ) {
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

        // Add bulk order flag if active; preserve raw query value if available
        if (isBulkOrderOnly || rawIsBulkOrderQuery !== null) {
          const val = rawIsBulkOrderQuery ?? "true";
          url += `&is_bulk_order=${encodeURIComponent(val)}`;
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
      isBulkOrderOnly,
      rawIsBulkOrderQuery,
      user,
      salesperson,
    ]
  );

  // Initialize from URL query parameters (bulk orders + date)
  useEffect(() => {
    const isBulk = searchParams?.get("is_bulk_order");
    const start = searchParams?.get("start_date");
    const end = searchParams?.get("end_date");

    const toDate = (value: string | null): Date | undefined => {
      if (!value) return undefined;
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    };

    const fromDate = toDate(start);
    const to = toDate(end ?? start ?? null);

    if (isBulk !== null) {
      // Accept any truthy markers ("true", "1", "yes")
      const normalized = String(isBulk).toLowerCase();
      const truthy =
        normalized === "true" ||
        normalized === "1" ||
        normalized === "yes" ||
        normalized === "y";
      setIsBulkOrderOnly(truthy);
      setRawIsBulkOrderQuery(isBulk);
    }
    if (fromDate || to) {
      setDateRange({ from: fromDate, to });
    }
    setInitializedFromQuery(true);
  }, [searchParams, setDateRange]);

  // (fetching is gated in the main effect below using initializedFromQuery)

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
    if (!initializedFromQuery) return;
    fetchSales(currentPage);
  }, [currentPage, fetchSales, initializedFromQuery]);

  // Removed redundant effect that reset the page and refetched on filter changes.

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

  const handleLogisticsChange = async (saleId: string, logisticsId: string) => {
    try {
      // If logisticsId is 'none', set it to null
      const logisticsValue = logisticsId === "none" ? null : logisticsId;

      await api
        .patch(`/api/sales/orders/${saleId}/`, { logistics: logisticsValue })
        .then((response) => {
          // Extract updated order_status from API response
          const updatedOrderStatus = response.data?.order_status;
          const updatedLogistics = response.data?.logistics ?? logisticsValue;

          setDisplayData((prevData) =>
            prevData.map((sale) =>
              sale.id.toString() === saleId
                ? {
                    ...sale,
                    logistics: updatedLogistics,
                    ...(updatedOrderStatus && {
                      order_status: updatedOrderStatus,
                    }),
                  }
                : sale
            )
          );
          setSales((prevSales) => {
            if (!prevSales) return prevSales;
            return {
              ...prevSales,
              results: prevSales.results.map((sale) =>
                sale.id.toString() === saleId
                  ? {
                      ...sale,
                      logistics: updatedLogistics,
                      ...(updatedOrderStatus && {
                        order_status: updatedOrderStatus,
                      }),
                    }
                  : sale
              ),
            };
          });
        })
        .catch((err) => {
          console.log(err);
          showError("Failed to update logistics");
        });
    } catch (error) {
      console.error("Error updating logistics:", error);
      showError("Failed to update logistics");
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
              location_id: location.id,
              location_name: location.name,
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
                location_id: location.id,
                location_name: location.name,
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

      if (user?.role === "Franchise") {
        // Franchise: use /api/sales/sales-summary/ with date range
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales/export-summary/`;
        const [from, to] = franchiseExportDateRange;
        const params: string[] = [];
        if (from) {
          const year = from.getFullYear();
          const month = String(from.getMonth() + 1).padStart(2, "0");
          const day = String(from.getDate()).padStart(2, "0");
          params.push(`date_from=${year}-${month}-${day}`);
        }
        if (to) {
          const year = to.getFullYear();
          const month = String(to.getMonth() + 1).padStart(2, "0");
          const day = String(to.getDate()).padStart(2, "0");
          params.push(`date_to=${year}-${month}-${day}`);
        }
        // Append advanced export filters
        if (typeof totalAmountMin === "number")
          params.push(`total_amount_min=${totalAmountMin}`);
        if (typeof totalAmountMax === "number")
          params.push(`total_amount_max=${totalAmountMax}`);
        if (typeof productsCountMin === "number")
          params.push(`products_count_min=${productsCountMin}`);
        if (typeof productsCountMax === "number")
          params.push(`products_count_max=${productsCountMax}`);
        if (typeof moreThan3Products === "boolean")
          params.push(`more_than_3_products=${moreThan3Products}`);
        if (typeof multipleOrdersCustomer === "boolean")
          params.push(`multiple_orders_customer=${multipleOrdersCustomer}`);
        if (typeof oilBottleTotalMin === "number")
          params.push(`oil_bottle_total_min=${oilBottleTotalMin}`);

        // Append franchise id if available
        if (user?.franchise_id) {
          params.push(`franchise=${user.franchise_id}`);
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        });
        const urlObject = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = urlObject;
        link.setAttribute("download", "franchise_sales_summary.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportModal(false);
        return;
      }
      // Default: Packaging and others
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales/export-csv/`;
      const params: string[] = [];
      if (user?.role === "Packaging" && logistic && logistic !== "all") {
        params.push(`logistics=${encodeURIComponent(logistic)}`);
      }
      // Append franchise id if available/requested
      if (user?.franchise_id) {
        params.push(`franchise=${user.franchise_id}`);
      }
      // Append advanced export filters (optional for this endpoint as well)
      if (typeof totalAmountMin === "number")
        params.push(`total_amount_min=${totalAmountMin}`);
      if (typeof totalAmountMax === "number")
        params.push(`total_amount_max=${totalAmountMax}`);
      if (typeof productsCountMin === "number")
        params.push(`products_count_min=${productsCountMin}`);
      if (typeof productsCountMax === "number")
        params.push(`products_count_max=${productsCountMax}`);
      if (typeof moreThan3Products === "boolean")
        params.push(`more_than_3_products=${moreThan3Products}`);
      if (typeof multipleOrdersCustomer === "boolean")
        params.push(`multiple_orders_customer=${multipleOrdersCustomer}`);
      if (typeof oilBottleTotalMin === "number")
        params.push(`oil_bottle_total_min=${oilBottleTotalMin}`);
      if (typeof oilBottleOnly === "boolean")
        params.push(`oil_bottle_only=${oilBottleOnly}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const urlObject = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlObject;
      let filename = "sales_export.csv";
      if (user?.role === "Packaging" && logistic && logistic !== "all") {
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
        currentPage={currentPage}
      />

      {showExportModal && (
        <ExportModal
          open={showExportModal}
          exportDateRange={franchiseExportDateRange}
          setExportDateRange={setFranchiseExportDateRange}
          handleExportCSV={handleExportCSV}
          setShowExportModal={setShowExportModal}
          userRole={user?.role}
          totalAmountMin={totalAmountMin}
          setTotalAmountMin={setTotalAmountMin}
          totalAmountMax={totalAmountMax}
          setTotalAmountMax={setTotalAmountMax}
          productsCountMin={productsCountMin}
          setProductsCountMin={setProductsCountMin}
          productsCountMax={productsCountMax}
          setProductsCountMax={setProductsCountMax}
          moreThan3Products={moreThan3Products}
          setMoreThan3Products={setMoreThan3Products}
          multipleOrdersCustomer={multipleOrdersCustomer}
          setMultipleOrdersCustomer={setMultipleOrdersCustomer}
          oilBottleTotalMin={oilBottleTotalMin}
          setOilBottleTotalMin={setOilBottleTotalMin}
          oilBottleOnly={oilBottleOnly}
          setOilBottleOnly={setOilBottleOnly}
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
          handleLogisticsChange={handleLogisticsChange}
          handleEdit={handleEdit}
          setSelectedPaymentImage={setSelectedPaymentImage}
          setShowPaymentImageModal={setShowPaymentImageModal}
          onLocationUpdate={handleLocationUpdate}
          selectedLogisticFilter={logistic}
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

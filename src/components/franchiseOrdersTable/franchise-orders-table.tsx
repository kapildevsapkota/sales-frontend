"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import axios from "axios";
import { startOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  RANKINGS_END_DATE,
  RANKINGS_START_DATE,
} from "@/components/salesfest/super-admin/constants";
import type { SaleItem, SalesResponse } from "@/types/sale";
import { FranchiseOrdersTableHeader } from "./components/franchise-orders-table-header";
import { FranchiseOrdersTableBody } from "./components/franchise-orders-table-body";
import { TablePagination } from "@/components/salesTable/components/table-pagination";
import { PaymentImageModal } from "@/components/salesTable/components/payment-image-modal";
import { useTableData } from "@/components/salesTable/hooks/use-table-data";
import { useFranchiseOrdersColumns } from "./hooks/use-franchise-orders-columns";
import { ExportModal } from "@/components/salesTable/components/export-modal";
import { toast } from "sonner";
import { ErrorDialog } from "@/components/ErrorDialog";
import { Role, useAuth } from "@/contexts/AuthContext";

interface FranchiseOrdersTableProps {
  franchiseId?: string;
  endpoint?: string;
  festMode?: boolean;
  selectableRows?: boolean;
  showExportPickAndDrop?: boolean;
  canChangeStatus?: boolean;
}

const formatApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayRange = (): DateRange => {
  const today = startOfDay(new Date());
  return { from: today, to: today };
};

const getFestFullRange = (): DateRange => ({
  from: startOfDay(RANKINGS_START_DATE),
  to: startOfDay(RANKINGS_END_DATE),
});

const clampFestDateRange = (range: DateRange): DateRange => {
  const festStart = startOfDay(RANKINGS_START_DATE);
  const festEnd = startOfDay(RANKINGS_END_DATE);

  let from = startOfDay(range.from!);
  let to = range.to ? startOfDay(range.to) : from;

  if (from < festStart) from = festStart;
  if (from > festEnd) from = festEnd;
  if (to < festStart) to = festStart;
  if (to > festEnd) to = festEnd;
  if (from > to) to = from;

  return { from, to };
};

export default function FranchiseOrdersTable({
  franchiseId,
  endpoint,
  festMode = false,
  selectableRows = false,
  showExportPickAndDrop = false,
  canChangeStatus,
}: FranchiseOrdersTableProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === Role.SuperAdmin;
  const allowStatusChange =
    canChangeStatus !== undefined ? canChangeStatus : isSuperAdmin;

  const [sales, setSales] = useState<SalesResponse | null>(null);
  const [displayData, setDisplayData] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [filterTerm, setFilterTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [deliveryType, setDeliveryType] = useState("all");
  const [logistic, setLogistic] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    festMode ? getTodayRange() : undefined,
  );
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Export Modal Filters & Advanced Filter States
  const [showExportModal, setShowExportModal] = useState(false);
  const [franchiseExportDateRange, setFranchiseExportDateRange] = useState<
    [Date | undefined, Date | undefined]
  >([undefined, undefined]);
  const [totalAmountMin, setTotalAmountMin] = useState<number | undefined>();
  const [totalAmountMax, setTotalAmountMax] = useState<number | undefined>();
  const [productsCountMin, setProductsCountMin] = useState<number | undefined>();
  const [productsCountMax, setProductsCountMax] = useState<number | undefined>();
  const [moreThan3Products, setMoreThan3Products] = useState<boolean | undefined>();
  const [multipleOrdersCustomer, setMultipleOrdersCustomer] = useState<boolean | undefined>();
  const [oilBottleTotalMin, setOilBottleTotalMin] = useState<number | undefined>();
  const [oilBottleOnly, setOilBottleOnly] = useState<boolean | undefined>();

  // Mirror table filter states inside export modal
  const [exportSearchInput, setExportSearchInput] = useState("");
  const [exportPaymentMethod, setExportPaymentMethod] = useState("all");
  const [exportOrderStatus, setExportOrderStatus] = useState("all");
  const [exportDeliveryType, setExportDeliveryType] = useState("all");
  const [exportLogistic, setExportLogistic] = useState("all");

  const tableRef = useRef<HTMLTableElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const { columns, toggleColumnVisibility, showAllColumns, hideAllColumns } =
    useFranchiseOrdersColumns();
  const { getValueByColumnId } = useTableData();

  const showError = useCallback((message: string) => {
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    async (sale: SaleItem, newStatus: string) => {
      const saleId = String(sale.id);
      try {
        const token = localStorage.getItem("accessToken");
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sales/orders/${saleId}/`,
          { order_status: newStatus },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDisplayData((prev) =>
          prev.map((item) =>
            String(item.id) === saleId
              ? { ...item, order_status: newStatus }
              : item
          )
        );
        setSales((prevSales) => {
          if (!prevSales) return prevSales;
          return {
            ...prevSales,
            results: prevSales.results.map((item) =>
              String(item.id) === saleId
                ? { ...item, order_status: newStatus }
                : item
            ),
          };
        });
        toast.success("Order status updated successfully");
      } catch (error) {
        console.error("Error updating order status:", error);
        showError("Failed to update order status");
      }
    },
    [showError]
  );

  const handleLogisticsChange = useCallback(
    async (saleId: string, logisticsValue: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sales/orders/${saleId}/`,
          { logistics: logisticsValue === "none" ? null : logisticsValue },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDisplayData((prev) =>
          prev.map((item) =>
            String(item.id) === String(saleId)
              ? { ...item, logistics: logisticsValue === "none" ? null : logisticsValue }
              : item
          )
        );
      } catch (error) {
        console.error("Error updating logistics:", error);
        showError("Failed to update logistics");
      }
    },
    [showError]
  );

  const handleLocationUpdate = useCallback(
    (saleId: number, location: { id: number; name: string }) => {
      setDisplayData((prev) =>
        prev.map((item) =>
          item.id === saleId
            ? { ...item, location_id: location.id, location_name: location.name }
            : item
        )
      );
    },
    []
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = displayData.map((item) => item.id);
        setSelectedOrderIds(allIds);
      } else {
        setSelectedOrderIds([]);
      }
    },
    [displayData],
  );

  const handleSelectRow = useCallback((id: number, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, id]);
    } else {
      setSelectedOrderIds((prev) => prev.filter((item) => item !== id));
    }
  }, []);

  const handleExportSelectedOrders = useCallback(
    async (format: string = "xlsx") => {
      if (selectedOrderIds.length === 0) {
        showError("Please select at least one order to export.");
        return;
      }
      try {
        setIsExporting(true);
        const token = localStorage.getItem("accessToken");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sales/export-selected-orders/`,
          {
            order_ids: selectedOrderIds,
            export_format: format,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `selected_orders.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error exporting selected orders:", error);
        showError("Failed to export selected orders. Please try again.");
      } finally {
        setIsExporting(false);
      }
    },
    [selectedOrderIds, showError],
  );

  const effectiveDateRange = useMemo(() => {
    if (!festMode) return dateRange;
    if (!dateRange?.from) return getFestFullRange();
    return clampFestDateRange(dateRange);
  }, [dateRange, festMode]);

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      if (!festMode) {
        setDateRange(range);
        return;
      }
      if (!range?.from) {
        setDateRange(undefined);
        return;
      }
      setDateRange(clampFestDateRange(range));
    },
    [festMode],
  );

  const handleOpenExportModal = useCallback(() => {
    setExportSearchInput(searchInput);
    setExportPaymentMethod(paymentMethod);
    setExportOrderStatus(orderStatus);
    setExportDeliveryType(deliveryType);
    setExportLogistic(logistic);
    if (effectiveDateRange?.from || effectiveDateRange?.to) {
      setFranchiseExportDateRange([
        effectiveDateRange.from,
        effectiveDateRange.to,
      ]);
    } else {
      setFranchiseExportDateRange([undefined, undefined]);
    }
    setShowExportModal(true);
  }, [
    searchInput,
    paymentMethod,
    orderStatus,
    deliveryType,
    logistic,
    effectiveDateRange,
  ]);

  const handleExportCSV = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
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

      if (franchiseId) {
        params.push(`franchise=${encodeURIComponent(franchiseId)}`);
      }

      if (exportSearchInput) {
        params.push(`search=${encodeURIComponent(exportSearchInput)}`);
      }
      if (exportPaymentMethod && exportPaymentMethod !== "all") {
        params.push(
          `payment_method=${encodeURIComponent(exportPaymentMethod)}`,
        );
      }
      if (exportOrderStatus && exportOrderStatus !== "all") {
        params.push(`order_status=${encodeURIComponent(exportOrderStatus)}`);
      }
      if (exportDeliveryType && exportDeliveryType !== "all") {
        params.push(
          `delivery_type=${encodeURIComponent(exportDeliveryType)}`,
        );
      }
      if (exportLogistic && exportLogistic !== "all") {
        params.push(`logistics=${encodeURIComponent(exportLogistic)}`);
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

      const blob = response.data as Blob;
      const contentType = response.headers?.["content-type"] || blob.type || "";
      if (contentType.includes("application/json") || blob.size < 1000) {
        try {
          const text = await blob.text();
          const json = JSON.parse(text);
          if (json.error || json.message || json.detail) {
            const errMsg = json.error || json.message || json.detail;
            showError(errMsg);
            toast.error(errMsg);
            return;
          }
        } catch {
          // not json, proceed with file download
        }
      }

      const urlObject = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlObject;
      const downloadFilename = franchiseId
        ? `franchise_${franchiseId}_sales_summary.csv`
        : `orders_sales_summary.csv`;
      link.setAttribute("download", downloadFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlObject);
      setShowExportModal(false);
      toast.success("Sales summary exported successfully");
    } catch (error: any) {
      console.error("Error exporting franchise summary:", error);
      let errMsg = "Failed to export franchise sales summary. Please try again.";
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json.error || json.message || json.detail) {
            errMsg = json.error || json.message || json.detail;
          }
        } catch {
          // ignore
        }
      } else if (error?.response?.data?.error) {
        errMsg = error.response.data.error;
      } else if (typeof error?.message === "string") {
        errMsg = error.message;
      }
      showError(errMsg);
      toast.error(errMsg);
    }
  }, [
    franchiseExportDateRange,
    totalAmountMin,
    totalAmountMax,
    productsCountMin,
    productsCountMax,
    moreThan3Products,
    multipleOrdersCustomer,
    oilBottleTotalMin,
    oilBottleOnly,
    franchiseId,
    exportSearchInput,
    exportPaymentMethod,
    exportOrderStatus,
    exportDeliveryType,
    exportLogistic,
    showError,
  ]);

  const fetchOrders = useCallback(
    async (page = 1, searchOverride?: string) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");
        const term = searchOverride !== undefined ? searchOverride : filterTerm;
        const baseEndpoint = franchiseId
          ? `/api/sales/orders/franchise/${franchiseId}/`
          : endpoint || "/api/sales/orders/";
        let url = `${process.env.NEXT_PUBLIC_API_URL}${baseEndpoint}?page=${page}&page_size=${pageSize}`;

        if (term && term.trim()) {
          url += `&search=${encodeURIComponent(term.trim())}`;
        }
        if (paymentMethod !== "all") {
          url += `&payment_method=${encodeURIComponent(paymentMethod)}`;
        }
        if (orderStatus !== "all") {
          url += `&order_status=${encodeURIComponent(orderStatus)}`;
        }
        if (deliveryType !== "all") {
          url += `&delivery_type=${encodeURIComponent(deliveryType)}`;
        }
        if (logistic !== "all") {
          url += `&logistics=${encodeURIComponent(logistic)}`;
        }

        if (effectiveDateRange?.from) {
          url += `&start_date=${formatApiDate(effectiveDateRange.from)}`;
        } else if (festMode) {
          url += `&start_date=${formatApiDate(startOfDay(RANKINGS_START_DATE))}`;
        }

        if (effectiveDateRange?.to) {
          url += `&end_date=${formatApiDate(effectiveDateRange.to)}`;
        } else if (festMode) {
          url += `&end_date=${formatApiDate(startOfDay(RANKINGS_END_DATE))}`;
        }

        const response = await axios.get<SalesResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSales(response.data);
        setDisplayData(response.data.results || []);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching orders:", error);
        showError("Failed to fetch orders");
      } finally {
        setIsLoading(false);
      }
    },
    [
      franchiseId,
      endpoint,
      pageSize,
      filterTerm,
      paymentMethod,
      orderStatus,
      deliveryType,
      logistic,
      effectiveDateRange,
      festMode,
      showError,
    ],
  );

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        const trimmed = value.trim();
        setFilterTerm(trimmed);
        fetchOrders(1, trimmed);
      }, 350);
    },
    [fetchOrders]
  );

  const handleSearchSubmit = useCallback(() => {
    clearTimeout(searchTimeout.current);
    const trimmed = searchInput.trim();
    setFilterTerm(trimmed);
    fetchOrders(1, trimmed);
  }, [searchInput, fetchOrders]);

  const handleClearSearch = useCallback(() => {
    clearTimeout(searchTimeout.current);
    setSearchInput("");
    setFilterTerm("");
    fetchOrders(1, "");
  }, [fetchOrders]);

  const handleClearFilters = useCallback(() => {
    clearTimeout(searchTimeout.current);
    setSearchInput("");
    setFilterTerm("");
    setPaymentMethod("all");
    setOrderStatus("all");
    setDeliveryType("all");
    setLogistic("all");
    setDateRange(festMode ? getTodayRange() : undefined);
    fetchOrders(1, "");
  }, [fetchOrders, festMode]);

  useEffect(() => {
    if (sales?.results) {
      setDisplayData(sales.results);
    }
  }, [sales]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [paymentMethod, orderStatus, deliveryType, logistic, effectiveDateRange]);

  const festMaxDate = startOfDay(RANKINGS_END_DATE);

  return (
    <div className="relative flex flex-col min-h-[60vh]">
      <FranchiseOrdersTableHeader
        columns={columns}
        toggleColumnVisibility={toggleColumnVisibility}
        showAllColumns={showAllColumns}
        hideAllColumns={hideAllColumns}
        salesCount={sales?.count || 0}
        searchInput={searchInput}
        handleSearchInputChange={handleSearchInputChange}
        handleSearchSubmit={handleSearchSubmit}
        handleClearSearch={handleClearSearch}
        isSearching={isLoading}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        orderStatus={orderStatus}
        setOrderStatus={setOrderStatus}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        logistic={logistic}
        setLogistic={setLogistic}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        onClearFilters={handleClearFilters}
        minDate={festMode ? startOfDay(RANKINGS_START_DATE) : undefined}
        maxDate={festMode ? festMaxDate : undefined}
        dateClearable={true}
        dateEmptyLabel={
          festMode
            ? `All fest dates (${formatApiDate(RANKINGS_START_DATE)} – ${formatApiDate(RANKINGS_END_DATE)})`
            : "Filter by date"
        }
        showExportPickAndDrop={showExportPickAndDrop}
        selectedCount={selectedOrderIds.length}
        onExportSelected={() => handleExportSelectedOrders("xlsx")}
        isExporting={isExporting}
        onOpenExportModal={isSuperAdmin ? handleOpenExportModal : undefined}
      />

      {showExportModal && (
        <ExportModal
          open={showExportModal}
          exportDateRange={franchiseExportDateRange}
          setExportDateRange={setFranchiseExportDateRange}
          handleExportCSV={handleExportCSV}
          setShowExportModal={setShowExportModal}
          userRole="Franchise"
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
          exportSearchInput={exportSearchInput}
          setExportSearchInput={setExportSearchInput}
          exportPaymentMethod={exportPaymentMethod}
          setExportPaymentMethod={setExportPaymentMethod}
          exportOrderStatus={exportOrderStatus}
          setExportOrderStatus={setExportOrderStatus}
          exportDeliveryType={exportDeliveryType}
          setExportDeliveryType={setExportDeliveryType}
          exportLogistic={exportLogistic}
          setExportLogistic={setExportLogistic}
        />
      )}

      {showPaymentImageModal && (
        <PaymentImageModal
          selectedPaymentImage={selectedPaymentImage}
          setShowPaymentImageModal={setShowPaymentImageModal}
        />
      )}

      <div className="flex-1 overflow-auto border rounded-md my-3">
        <FranchiseOrdersTableBody
          tableRef={tableRef as React.RefObject<HTMLTableElement>}
          columns={columns}
          isLoading={isLoading}
          displayData={displayData}
          currentPage={currentPage}
          pageSize={pageSize}
          getValueByColumnId={getValueByColumnId}
          onViewPaymentImage={(url) => {
            setSelectedPaymentImage(url);
            setShowPaymentImageModal(true);
          }}
          selectableRows={selectableRows}
          selectedOrderIds={selectedOrderIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          handleOrderStatusChange={
            allowStatusChange ? handleStatusChange : undefined
          }
          handleLogisticsChange={handleLogisticsChange}
          onLocationUpdate={handleLocationUpdate}
          selectedLogisticFilter={logistic}
        />
      </div>

      {sales && (
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200">
          <TablePagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={sales.count || 0}
            hasNext={!!sales.next}
            fetchSales={fetchOrders}
          />
        </div>
      )}

      <ErrorDialog
        open={errorDialogOpen}
        message={errorDialogMessage}
        onClose={() => setErrorDialogOpen(false)}
      />
    </div>
  );
}

export { FranchiseOrdersTable, FranchiseOrdersTable as OrdersTable };

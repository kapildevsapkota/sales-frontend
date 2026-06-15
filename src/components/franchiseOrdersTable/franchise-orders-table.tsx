"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import axios from "axios";
import { startOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import type { SaleItem, SalesResponse } from "@/types/sale";
import { FranchiseOrdersTableHeader } from "./components/franchise-orders-table-header";
import { FranchiseOrdersTableBody } from "./components/franchise-orders-table-body";
import { TablePagination } from "@/components/salesTable/components/table-pagination";
import { PaymentImageModal } from "@/components/salesTable/components/payment-image-modal";
import { useTableData } from "@/components/salesTable/hooks/use-table-data";
import { useFranchiseOrdersColumns } from "./hooks/use-franchise-orders-columns";
import { ErrorDialog } from "@/components/ErrorDialog";

interface FranchiseOrdersTableProps {
  franchiseId: string;
  festMode?: boolean;
  minDate?: Date;
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

const getFestFullRange = (minDate: Date): DateRange => ({
  from: startOfDay(minDate),
  to: startOfDay(new Date()),
});

const clampFestDateRange = (
  range: DateRange,
  minDate: Date,
): DateRange => {
  const today = startOfDay(new Date());
  const festStart = startOfDay(minDate);

  let from = startOfDay(range.from!);
  let to = range.to ? startOfDay(range.to) : from;

  if (from < festStart) from = festStart;
  if (from > today) from = today;
  if (to < festStart) to = festStart;
  if (to > today) to = today;
  if (from > to) to = from;

  return { from, to };
};

export default function FranchiseOrdersTable({
  franchiseId,
  festMode = false,
  minDate,
}: FranchiseOrdersTableProps) {
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    festMode ? getTodayRange() : undefined,
  );
  const [showPaymentImageModal, setShowPaymentImageModal] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState("");

  const tableRef = useRef<HTMLTableElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const { columns, toggleColumnVisibility, showAllColumns, hideAllColumns } =
    useFranchiseOrdersColumns();
  const { getValueByColumnId } = useTableData();

  const showError = useCallback((message: string) => {
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
  }, []);

  const effectiveDateRange = useMemo(() => {
    if (!festMode || !minDate) return dateRange;
    if (!dateRange?.from) return getFestFullRange(minDate);
    return clampFestDateRange(dateRange, minDate);
  }, [dateRange, festMode, minDate]);

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      if (!festMode || !minDate) {
        setDateRange(range);
        return;
      }
      if (!range?.from) {
        setDateRange(undefined);
        return;
      }
      setDateRange(clampFestDateRange(range, minDate));
    },
    [festMode, minDate],
  );

  const fetchOrders = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales/orders/franchise/${franchiseId}/?page=${page}&page_size=${pageSize}`;

        if (filterTerm) {
          url += `&search=${encodeURIComponent(filterTerm)}`;
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

        if (effectiveDateRange?.from) {
          url += `&start_date=${formatApiDate(effectiveDateRange.from)}`;
        } else if (festMode && minDate) {
          url += `&start_date=${formatApiDate(startOfDay(minDate))}`;
        }

        if (effectiveDateRange?.to) {
          url += `&end_date=${formatApiDate(effectiveDateRange.to)}`;
        } else if (festMode && minDate) {
          url += `&end_date=${formatApiDate(startOfDay(new Date()))}`;
        }

        const response = await axios.get<SalesResponse>(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSales(response.data);
        setDisplayData(response.data.results || []);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching franchise orders:", error);
        showError("Failed to fetch franchise orders");
      } finally {
        setIsLoading(false);
      }
    },
    [
      franchiseId,
      pageSize,
      filterTerm,
      paymentMethod,
      orderStatus,
      deliveryType,
      effectiveDateRange,
      festMode,
      minDate,
      showError,
    ],
  );

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
          sale.order_code,
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
          setFilterTerm(value);
          fetchOrders(1);
        } else if (value.length === 0) {
          setFilterTerm("");
          fetchOrders(1);
        } else {
          handleGlobalSearch(value);
        }
      }, 300);
    },
    [fetchOrders, handleGlobalSearch]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setFilterTerm("");
    setPaymentMethod("all");
    setOrderStatus("all");
    setDeliveryType("all");
    setDateRange(undefined);
    fetchOrders(1);
  }, [fetchOrders]);

  useEffect(() => {
    if (searchInput && searchInput.length < 3 && sales?.results) {
      handleGlobalSearch(searchInput);
      return;
    }
    if (sales?.results) {
      setDisplayData(sales.results);
    }
  }, [sales, searchInput, handleGlobalSearch]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [paymentMethod, orderStatus, deliveryType, effectiveDateRange, filterTerm]);

  const festMaxDate = startOfDay(new Date());

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
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        orderStatus={orderStatus}
        setOrderStatus={setOrderStatus}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        onClearFilters={handleClearFilters}
        minDate={festMode ? minDate : undefined}
        maxDate={festMode ? festMaxDate : undefined}
        dateClearable={festMode}
        dateEmptyLabel={
          festMode && minDate
            ? `All fest dates (${formatApiDate(minDate)} – today)`
            : undefined
        }
      />

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

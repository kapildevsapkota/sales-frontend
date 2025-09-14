"use client";
import { Search, ChevronDown, Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import type { SaleItem } from "@/types/sale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Column } from "@/types/sale";
import DateRangePicker from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import axios from "axios";
import { printOrders } from "@/utils/printOrder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SalesPerson {
  id: number;
  first_name: string;
  last_name: string;
}

interface ExportFilters {
  searchInput: string;
  paymentMethod: string;
  orderStatus: string;
  deliveryType: string;
  logistic: string;
  dateRange: DateRange | undefined;
}

interface TableHeaderProps {
  columns: Column[];
  toggleColumnVisibility: (columnId: string) => void;
  showAllColumns: () => void;
  hideAllColumns: () => void;
  salesCount: number;
  resultsCount: number;
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSearchInput: (value: string) => void;
  setFilterTerm: (value: string) => void;
  fetchSales: (page: number) => void;
  showFilterForm: boolean;
  setShowFilterForm: (value: boolean) => void;
  setShowExportModal: (value: boolean, filters?: ExportFilters) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  orderStatus: string;
  setOrderStatus: (value: string) => void;
  deliveryType: string;
  setDeliveryType: (value: string) => void;
  logistic: string;
  setLogistic: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  className?: string;
  sales: SaleItem[];
  salesperson: string;
  setSalesperson: (value: string) => void;
}

export function TableHeader({
  columns,
  toggleColumnVisibility,
  showAllColumns,
  hideAllColumns,
  salesCount,
  resultsCount,
  searchInput,
  handleSearchInputChange,
  setSearchInput,
  setFilterTerm,
  fetchSales,
  setShowExportModal,
  paymentMethod,
  setPaymentMethod,
  orderStatus,
  setOrderStatus,
  deliveryType,
  setDeliveryType,
  logistic,
  setLogistic,
  dateRange,
  setDateRange,
  className = "",
  sales,
  salesperson,
  setSalesperson,
}: TableHeaderProps) {
  const [salespersons, setSalespersons] = useState<SalesPerson[]>([]);
  const { user } = useAuth();
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryDate, setSummaryDate] = useState<Date | undefined>(undefined);
  const [isExportingSummary, setIsExportingSummary] = useState(false);

  // Fetch salespersons data on component mount
  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get<SalesPerson[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/account/salespersons/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSalespersons(response.data);
      } catch (error) {
        console.error("Error fetching salespersons:", error);
      }
    };

    fetchSalespersons();
  }, []);

  useEffect(() => {
    fetchSales(1);
  }, [paymentMethod, orderStatus, deliveryType, logistic, dateRange]);

  const handleDeliveryTypeChange = (value: string) => {
    setDeliveryType(value);
  };

  const handleLogisticChange = (value: string) => {
    setLogistic(value);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilterTerm("");
    setPaymentMethod("all");
    setOrderStatus("all");
    setDeliveryType("all");
    setSalesperson("all");
    if (user?.role === "Packaging") {
      setLogistic("all");
    }
    setDateRange(undefined);
    fetchSales(1);
  };

  const handleExportClick = () => {
    const currentFilters: ExportFilters = {
      searchInput,
      paymentMethod,
      orderStatus,
      deliveryType,
      logistic,
      dateRange,
    };
    setShowExportModal(true, currentFilters);
  };

  const handlePrintOrders = async () => {
    try {
      await printOrders({ orders: sales });
    } catch (error) {
      console.error("Error printing orders:", error);
    }
  };

  const handleExportSummary = async () => {
    if (!summaryDate) return;
    setIsExportingSummary(true);
    try {
      const token = localStorage.getItem("accessToken");
      const year = summaryDate.getFullYear();
      const month = String(summaryDate.getMonth() + 1).padStart(2, "0");
      const day = String(summaryDate.getDate()).padStart(2, "0");
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales/packaging/summary/?date=${year}-${month}-${day}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const urlObject = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlObject;
      link.setAttribute(
        "download",
        `packaging_summary_${year}-${month}-${day}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowSummaryModal(false);
    } catch (error) {
      console.error("Error exporting packaging summary:", error);
      // Optionally show error to user
    } finally {
      setIsExportingSummary(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {/* First Row: Columns toggler, results count, Export button */}
      <div className="flex items-center justify-between gap-2 w-full flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-0 px-2 h-8">
                Columns <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.visible}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="flex justify-between p-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showAllColumns}
                  className="w-[48%] px-1 h-7"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={hideAllColumns}
                  className="w-[48%] px-1 h-7"
                >
                  <EyeOff className="mr-1 h-4 w-4" />
                  None
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap min-w-0 truncate">
          {resultsCount ? `${resultsCount} of ${salesCount} entries` : ""}
          {user?.role === "Packaging" && logistic !== "all" && (
            <span className="ml-2 text-blue-600 font-medium">({logistic})</span>
          )}
        </div>
        <div className="flex-1 flex justify-end min-w-0 gap-2">
          {user?.role === "Packaging" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap bg-green-400 hover:bg-green-500 px-2 h-8 min-w-0"
                onClick={() => setShowSummaryModal(true)}
              >
                Export Summary
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap bg-yellow-400 hover:bg-yellow-500 px-2 h-8 min-w-0"
                onClick={handleExportClick}
              >
                <span>
                  Export Dash
                  {user?.role === "Packaging" &&
                    logistic !== "all" &&
                    ` (${logistic})`}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 whitespace-nowrap bg-blue-400 hover:bg-blue-500 px-2 h-8 min-w-0"
                onClick={handlePrintOrders}
              >
                Print Order
              </Button>
            </>
          )}
          {user?.role === "Franchise" && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 whitespace-nowrap bg-yellow-400 hover:bg-yellow-500 px-2 h-8 min-w-0"
              onClick={handleExportClick}
            >
              Export Report
            </Button>
          )}
        </div>
      </div>
      {/* Second Row: All filters in a single compact row */}
      <div className="flex flex-wrap items-center gap-2 w-full">
        <div className="relative w-full sm:w-[180px] md:w-[220px] min-w-0">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search sales..."
            className="pl-8 pr-8 h-8 rounded-md border border-gray-300 text-sm min-w-0"
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => {
                setSearchInput("");
                setFilterTerm("");
                fetchSales(1);
              }}
            >
              ×
            </Button>
          )}
        </div>
        <div className="w-[120px] min-w-0">
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Cash on Delivery">Cash</SelectItem>
              <SelectItem value="Prepaid">Prepaid</SelectItem>
              <SelectItem value="Office Visit">Office</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[120px] min-w-0">
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Sent to Dash">Sent to Dash</SelectItem>
              <SelectItem value="Indrive">Indrive</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Returned By Customer">
                Returned By Customer
              </SelectItem>
              <SelectItem value="Returned By Dash">Returned By Dash</SelectItem>
              <SelectItem value="Return Pending">Return Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[120px] min-w-0">
          <Select value={deliveryType} onValueChange={handleDeliveryTypeChange}>
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Delivery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Inside valley">Inside</SelectItem>
              <SelectItem value="Outside valley">Outside</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[120px] min-w-0">
          <Select value={salesperson} onValueChange={setSalesperson}>
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue placeholder="Salesperson" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {salespersons.map((person) => (
                <SelectItem key={person.id} value={person.id.toString()}>
                  {`${person.first_name} ${person.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {user?.role === "Packaging" ||
          (user?.role === "Franchise" && (
            <div className="w-[120px] min-w-0">
              <Select value={logistic} onValueChange={handleLogisticChange}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Logistics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="YDM">YDM</SelectItem>
                  <SelectItem value="DASH">DASH</SelectItem>
                  <SelectItem value="NCM">NCM</SelectItem>
                  <SelectItem value="Pick and Drop">Pick and Drop</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        <div className="min-w-0">
          <DateRangePicker
            className="w-full h-8 text-xs"
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
        {(searchInput ||
          paymentMethod !== "all" ||
          orderStatus !== "all" ||
          deliveryType !== "all" ||
          (user?.role === "Packaging" && logistic !== "all") ||
          dateRange !== undefined) && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 whitespace-nowrap bg-red-400 hover:bg-red-500 px-2 h-8 min-w-0"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>
      {/* Export Summary Modal */}
      <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Packaging Summary</DialogTitle>
            <DialogDescription>
              Select a date to export the summary as CSV.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <input
              type="date"
              className="border rounded px-2 py-1 w-full"
              value={summaryDate ? summaryDate.toISOString().slice(0, 10) : ""}
              onChange={(e) =>
                setSummaryDate(
                  e.target.value ? new Date(e.target.value) : undefined
                )
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSummaryModal(false)}
              disabled={isExportingSummary}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExportSummary}
              disabled={!summaryDate || isExportingSummary}
            >
              {isExportingSummary ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

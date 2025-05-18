"use client";
import { Search, ChevronDown, Eye, EyeOff } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
import { useEffect } from "react";
import DateRangePicker from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

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
  setShowExportModal: (value: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  orderStatus: string;
  setOrderStatus: (value: string) => void;
  deliveryType: string;
  setDeliveryType: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  className?: string;
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
  dateRange,
  setDateRange,
  className = "",
}: TableHeaderProps) {
  useEffect(() => {
    fetchSales(1);
  }, [paymentMethod, orderStatus, deliveryType, dateRange]);

  const handleDeliveryTypeChange = (value: string) => {
    setDeliveryType(value);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilterTerm("");
    setPaymentMethod("all");
    setOrderStatus("all");
    setDeliveryType("all");
    setDateRange(undefined);
    fetchSales(1);
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
        </div>
        <div className="flex-1 flex justify-end min-w-0">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 whitespace-nowrap bg-blue-400 hover:bg-blue-500 px-2 h-8 min-w-0"
            onClick={() => setShowExportModal(true)}
          >
            <span>Export CSV</span>
          </Button>
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
    </div>
  );
}

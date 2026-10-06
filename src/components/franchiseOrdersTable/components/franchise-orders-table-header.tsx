"use client";

import type React from "react";
import { ChevronDown, Download, Eye, EyeOff, Search } from "lucide-react";
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
import DateRangePicker from "@/components/ui/date-range-picker";
import type { Column } from "@/types/sale";
import { DateRange } from "react-day-picker";

interface FranchiseOrdersTableHeaderProps {
  columns: Column[];
  toggleColumnVisibility: (columnId: string) => void;
  showAllColumns: () => void;
  hideAllColumns: () => void;
  salesCount: number;
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  orderStatus: string;
  setOrderStatus: (value: string) => void;
  deliveryType: string;
  setDeliveryType: (value: string) => void;
  logistic?: string;
  setLogistic?: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
  minDate?: Date;
  maxDate?: Date;
  dateClearable?: boolean;
  dateEmptyLabel?: string;
  showExportPickAndDrop?: boolean;
  selectedCount?: number;
  onExportSelected?: () => void;
  isExporting?: boolean;
  onOpenExportModal?: () => void;
}

export function FranchiseOrdersTableHeader({
  columns,
  toggleColumnVisibility,
  showAllColumns,
  hideAllColumns,
  salesCount,
  searchInput,
  handleSearchInputChange,
  paymentMethod,
  setPaymentMethod,
  orderStatus,
  setOrderStatus,
  deliveryType,
  setDeliveryType,
  logistic = "all",
  setLogistic,
  dateRange,
  setDateRange,
  onClearFilters,
  minDate,
  maxDate,
  dateClearable,
  dateEmptyLabel,
  showExportPickAndDrop = false,
  selectedCount = 0,
  onExportSelected,
  isExporting = false,
  onOpenExportModal,
}: FranchiseOrdersTableHeaderProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
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
                  className="w-[48%] h-7"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={hideAllColumns}
                  className="w-[48%] h-7"
                >
                  <EyeOff className="mr-1 h-4 w-4" />
                  None
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm text-muted-foreground">
            {salesCount.toLocaleString()} orders
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenExportModal && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-black border-0 font-medium"
              onClick={onOpenExportModal}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          )}

          {showExportPickAndDrop && (
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              onClick={onExportSelected}
              disabled={isExporting || selectedCount === 0}
            >
              <Download className="h-4 w-4" />
              {isExporting
                ? "Exporting..."
                : `Export Pick & Drop (${selectedCount})`}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchInput}
            onChange={handleSearchInputChange}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="Cash on Delivery">COD</SelectItem>
              <SelectItem value="Prepaid">Prepaid</SelectItem>
              <SelectItem value="Office Visit">Office Visit</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Sent to Dash">Sent to Dash</SelectItem>
              <SelectItem value="Sent to YDM">Sent to YDM</SelectItem>
              <SelectItem value="Sent to PicknDrop">Sent to PicknDrop</SelectItem>
              <SelectItem value="Sent to Daraz">Sent to Daraz</SelectItem>
              <SelectItem value="Out For Delivery">Out For Delivery</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Indrive">Indrive</SelectItem>
              <SelectItem value="Rescheduled">Rescheduled</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Returned By Customer">Returned By Customer</SelectItem>
              <SelectItem value="Returned By Dash">Returned By Dash</SelectItem>
              <SelectItem value="Returned By YDM">Returned By YDM</SelectItem>
              <SelectItem value="Returned By PicknDrop">Returned By PicknDrop</SelectItem>
              <SelectItem value="Returned By Daraz">Returned By Daraz</SelectItem>
              <SelectItem value="Return Pending">Return Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={deliveryType} onValueChange={setDeliveryType}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue placeholder="Delivery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Delivery</SelectItem>
              <SelectItem value="Inside valley">Inside valley</SelectItem>
              <SelectItem value="Outside valley">Outside valley</SelectItem>
            </SelectContent>
          </Select>

          {setLogistic && (
            <Select value={logistic} onValueChange={setLogistic}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue placeholder="Logistics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logistics</SelectItem>
                <SelectItem value="YDM">YDM</SelectItem>
                <SelectItem value="DASH">DASH</SelectItem>
                <SelectItem value="NCM">NCM</SelectItem>
                <SelectItem value="PicknDrop">PicknDrop</SelectItem>
                <SelectItem value="Daraz">Daraz</SelectItem>
              </SelectContent>
            </Select>
          )}

          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            minDate={minDate}
            maxDate={maxDate}
            clearable={dateClearable}
            emptyLabel={dateEmptyLabel}
          />

          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

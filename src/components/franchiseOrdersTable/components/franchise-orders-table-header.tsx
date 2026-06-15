"use client";

import type React from "react";
import { ChevronDown, Eye, EyeOff, Search } from "lucide-react";
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
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
  minDate?: Date;
  maxDate?: Date;
  dateClearable?: boolean;
  dateEmptyLabel?: string;
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
  dateRange,
  setDateRange,
  onClearFilters,
  minDate,
  maxDate,
  dateClearable,
  dateEmptyLabel,
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
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Sent to Dash">Sent to Dash</SelectItem>
              <SelectItem value="Sent to YDM">Sent to YDM</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
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

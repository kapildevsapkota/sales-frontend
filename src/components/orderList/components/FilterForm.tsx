"use client";

import type React from "react";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Column } from "@/types/sale";

interface FilterFormProps {
  filters: Record<string, string>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  dateRange: [Date | undefined, Date | undefined];
  setDateRange: React.Dispatch<
    React.SetStateAction<[Date | undefined, Date | undefined]>
  >;
  columns: Column[];
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function FilterForm({
  filters,
  setFilters,
  dateRange,
  setDateRange,
  columns,
  onApply,
  onClear,
  onClose,
}: FilterFormProps) {
  return (
    <div className="absolute z-20 left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Advanced Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex gap-2">
            <DatePicker
              selected={dateRange[0]}
              onChange={(date) =>
                setDateRange([date || undefined, dateRange[1]])
              }
              selectsStart
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              placeholderText="Start Date"
              className="w-full p-2 border rounded-md"
            />
            <DatePicker
              selected={dateRange[1]}
              onChange={(date) =>
                setDateRange([dateRange[0], date || undefined])
              }
              selectsEnd
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              minDate={dateRange[0]}
              placeholderText="End Date"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Add Status Filter */}
        <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
          <label className="text-sm font-medium">Order Status</label>
          <Select
            value={filters["order_status"] || ""}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                order_status: value,
              }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {columns
          .filter(
            (col) =>
              col.visible &&
              col.id !== "index" &&
              col.id !== "timestamp" &&
              col.id !== "full_name" &&
              col.id !== "phone_number" &&
              col.id !== "delivery_location" &&
              col.id !== "total_amount" &&
              col.id !== "payment_method" &&
              col.id !== "order_status" &&
              col.id !== "quantity"
          )
          .map((column) => (
            <div
              key={column.id}
              className="grid grid-cols-[120px_1fr] gap-2 items-center"
            >
              <label
                htmlFor={`filter-${column.id}`}
                className="text-sm font-medium"
              >
                {column.label}
              </label>
              <Input
                id={`filter-${column.id}`}
                placeholder={`Filter by ${column.label.toLowerCase()}`}
                value={filters[column.id] || ""}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    [column.id]: e.target.value,
                  }));
                }}
              />
            </div>
          ))}

        {/* Add Total Amount Range Filter */}
        <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
          <label className="text-sm font-medium">Total Amount Range</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters["total_amount_min"] || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  total_amount_min: e.target.value,
                }));
              }}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters["total_amount_max"] || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  total_amount_max: e.target.value,
                }));
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClear}>
          Clear All
        </Button>
        <Button onClick={onApply}>Apply Filters</Button>
      </div>
    </div>
  );
}

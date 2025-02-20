"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./sales-data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onReset?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onReset,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const searchValueFullName =
    (table.getColumn("full_name")?.getFilterValue() as string) ?? "";
  const searchValuePhoneNumber =
    (table.getColumn("phone_number")?.getFilterValue() as string) ?? "";
  const searchValueOrderStatus =
    (table.getColumn("order_status")?.getFilterValue() as string) ?? "";

  const handleFilterChange = (columnId: string, value: string) => {
    // Update the filter value for the specified column
    table.getColumn(columnId)?.setFilterValue(value);

    // Fetch all data from the backend with the new filter applied
    fetchDataWithFilters();
  };

  const fetchDataWithFilters = () => {
    // Implement your data fetching logic here
    // Use the current filter values to fetch data from the backend
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter Orders..."
          value={searchValueFullName}
          onChange={(event) =>
            handleFilterChange("full_name", event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="Filter Phone Number..."
          value={searchValuePhoneNumber}
          onChange={(event) =>
            handleFilterChange("phone_number", event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* New dropdown for order status filter */}
        <select
          value={searchValueOrderStatus}
          onChange={(event) =>
            handleFilterChange("order_status", event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px] border border-gray-300 rounded-md"
        >
          <option value="">Select Status..</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Canceled">Canceled</option>
        </select>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

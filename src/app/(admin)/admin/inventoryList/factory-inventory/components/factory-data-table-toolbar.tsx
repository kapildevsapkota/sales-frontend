"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./factory-data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onReset?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onReset,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const searchValueFactory =
    (table.getColumn("factory")?.getFilterValue() as string) ?? "";

  const handleFilterChange = (columnId: string, value: string) => {
    // Update the filter value for the specified column
    table.getColumn(columnId)?.setFilterValue(value);

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
          placeholder="Filter Factory..."
          value={searchValueFactory}
          onChange={(event) =>
            handleFilterChange("factory", event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

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

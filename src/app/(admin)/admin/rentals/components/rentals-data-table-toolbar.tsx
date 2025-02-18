"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./rentals-data-table-faceted-filter";
import { DataTableViewOptions } from "./rentals-data-table-view-options";
import { propertyTypes } from "./data/properyTypes";
import { bedroomOptions as newBedroomOptions } from "./data/bedroomOptions";
import { bathroomOptions as newBathroomOptions } from "./data/bathroomOptions";
import { availabilityStatuses as newAvailabilityStatuses } from "./data/availabilityStatuses";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onReset: () => void;
}

export function DataTableToolbar<TData>({
  table,
  onReset,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter properties..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("project_type") && (
          <DataTableFacetedFilter
            column={table.getColumn("project_type")}
            title="Property Type"
            options={propertyTypes}
          />
        )}
        {table.getColumn("bedrooms") && (
          <DataTableFacetedFilter
            column={table.getColumn("bedrooms")}
            title="Bedrooms"
            options={newBedroomOptions}
          />
        )}
        {table.getColumn("bathrooms") && (
          <DataTableFacetedFilter
            column={table.getColumn("bathrooms")}
            title="Bathrooms"
            options={newBathroomOptions}
          />
        )}
        {table.getColumn("availability") && (
          <DataTableFacetedFilter
            column={table.getColumn("availability")}
            title="Availability"
            options={newAvailabilityStatuses}
          />
        )}
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

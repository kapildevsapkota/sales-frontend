"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Rental } from "@/types/rentals";
import { Badge } from "@/components/ui/badge";
import { TableMeta } from "./rentals-data-table";
import { DataTableRowActions } from "./rentals-data-table-row-actions";
import { DataTableColumnHeader } from "./rentals-data-table-column-header";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export const columns: ColumnDef<Rental>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Property Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "project_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <span>{row.getValue("project_type")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const val = row.getValue(id);
      if (typeof val === "boolean") {
        return value.includes(val.toString());
      }
      return typeof val === "string" || typeof val === "number"
        ? value.includes(String(val))
        : false;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return <div className="font-medium">{formatPrice(price)}</div>;
    },
  },
  {
    accessorKey: "bedrooms",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Beds" />
    ),
    filterFn: (row, id, value) => {
      const val = row.getValue(id);
      if (typeof val === "boolean") {
        return value.includes(val.toString());
      }
      return typeof val === "string" || typeof val === "number"
        ? value.includes(String(val))
        : false;
    },
  },
  {
    accessorKey: "bathrooms",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Baths" />
    ),
    filterFn: (row, id, value) => {
      const val = row.getValue(id);
      if (typeof val === "boolean") {
        return value.includes(val.toString());
      }
      return typeof val === "string" || typeof val === "number"
        ? value.includes(String(val))
        : false;
    },
  },
  {
    accessorKey: "availability",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const availability = row.getValue("availability");
      return (
        <Badge variant={availability ? "default" : "secondary"}>
          {availability ? "Available" : "Not Available"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const val = row.getValue(id);
      if (typeof val === "boolean") {
        return value.includes(val.toString());
      }
      return typeof val === "string" || typeof val === "number"
        ? value.includes(String(val))
        : false;
    },
  },
  {
    accessorKey: "city.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActions
        row={row}
        onSuccess={() =>
          (table.options.meta as TableMeta<Rental>).refreshData()
        }
      />
    ),
  },
];

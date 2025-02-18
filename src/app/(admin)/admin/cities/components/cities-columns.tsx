"use client";

import { ColumnDef } from "@tanstack/react-table";
import { City } from "@/types/city";
import { DataTableRowActions } from "./cities-data-table-row-actions";
import { DataTableColumnHeader } from "./cities-data-table-column-header";
import type { TableMeta } from "./cities-data-table";

export const columns: ColumnDef<City>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City Name" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "state_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActions
        row={row}
        onSuccess={() => (table.options.meta as TableMeta<City>).refreshData()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enablePinning: true,
    size: 100,
  },
];

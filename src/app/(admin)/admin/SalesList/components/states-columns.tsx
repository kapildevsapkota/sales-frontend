"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Sale } from "@/types/sale";
import { DataTableColumnHeader } from "./states-data-table-column-header";
import { DataTableRowActions } from "./states-data-table-row-actions";
import { TableMeta } from "./states-data-table";

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Name" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "delivery_address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivery Address" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Amount" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "order_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Status" />
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActions
        row={row}
        onSuccess={() => (table.options.meta as TableMeta<Sale>).refreshData()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enablePinning: true,
    size: 100,
  },
];

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FactoryInventory } from "@/types/factory";
import { DataTableColumnHeader } from "./factory-data-table-column-header";
import { DataTableRowActions } from "./factory-data-table-row-actions";
import { TableMeta } from "./factory-data-table";

export const columns: ColumnDef<FactoryInventory>[] = [
  {
    accessorKey: "factory",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Factory" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "inventory.product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "inventory.quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" />
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActions
        row={row}
        onSuccess={() =>
          (table.options.meta as TableMeta<FactoryInventory>).refreshData()
        }
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enablePinning: true,
    size: 100,
  },
];

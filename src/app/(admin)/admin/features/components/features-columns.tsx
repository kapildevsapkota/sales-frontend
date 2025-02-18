"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Features } from "@/types/features";
import { DataTableRowActions } from "./features-data-table-row-actions";
import { DataTableColumnHeader } from "./features-data-table-column-header";
import type { TableMeta } from "./features-data-table";
import Image from "next/image";

export const columns: ColumnDef<Features>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Feature Name" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <Image
        src={row.getValue("image") as string}
        alt="Feature Image"
        width={50}
        height={50}
        className="rounded-md"
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActions
        row={row}
        onSuccess={() => (table.options.meta as TableMeta<Features>).refreshData()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    enablePinning: true,
    size: 100,
  },
];

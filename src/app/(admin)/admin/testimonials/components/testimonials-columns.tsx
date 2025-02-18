"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Testimonial } from "@/types/testimonials";
import Image from "next/image";
import { DataTableColumnHeader } from "./testimonials-data-table-column-header";
import { DataTableRowActions } from "./testimonials-data-table-row-actions";
import { TableMeta } from "./testimonials-data-table";

export const columns: ColumnDef<Testimonial>[] = [
  {
    accessorKey: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const image = row.getValue("image") as string;
      return image ? (
        <div className="relative w-10 h-10">
          <Image
            src={image}
            alt={row.getValue("name")}
            fill
            className="object-cover rounded-full"
          />
        </div>
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex max-w-[500px] items-center">
          <span className="truncate font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "testimonial",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Testimonial" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[500px] truncate prose dark:prose-invert prose-sm">
          <div
            dangerouslySetInnerHTML={{ __html: row.getValue("testimonial") }}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">
          {row.getValue("source") || "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActions
        row={row}
        onSuccess={() =>
          (table.options.meta as TableMeta<Testimonial>).refreshData()
        }
      />
    ),
  },
];

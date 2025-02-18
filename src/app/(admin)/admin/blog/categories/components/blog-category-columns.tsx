"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BlogCategory } from "@/types/blog";
import Image from "next/image";
import { DataTableColumnHeader } from "./blog-category-data-table-column-header";
import { DataTableRowActions } from "./blog-category-data-table-row-actions";
import { TableMeta } from "./blog-category-data-table";

export const columns: ColumnDef<BlogCategory>[] = [
  {
    accessorKey: "category_image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const image = row.getValue("category_image") as string;
      return image ? (
        <div className="relative w-10 h-10">
          <Image
            src={image}
            alt={row.getValue("category_name")}
            fill
            className="object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded-md" />
      );
    },
  },
  {
    accessorKey: "category_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex max-w-[500px] items-center">
          <span className="truncate font-medium">
            {row.getValue("category_name")}
          </span>
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
          (table.options.meta as TableMeta<BlogCategory>).refreshData()
        }
      />
    ),
  },
];

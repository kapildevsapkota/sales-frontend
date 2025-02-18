"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Blog, BlogCategory } from "@/types/blog";
import { Badge } from "@/components/ui/badge";
import { TableMeta } from "./blog-posts-data-table";
import { DataTableRowActions } from "./blog-posts-data-table-row-actions";
import { DataTableColumnHeader } from "./blog-posts-data-table-column-header";
import Image from "next/image";

export const columns: ColumnDef<Blog>[] = [
  {
    accessorKey: "thumbnail_image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const image = row.getValue("thumbnail_image") as string;
      return image ? (
        <div className="relative w-10 h-10">
          <Image
            src={image}
            alt={row.getValue("title")}
            fill
            className="object-cover rounded"
          />
        </div>
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded" />
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex max-w-[500px] items-center">
          <span className="truncate font-medium">{row.getValue("title")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "author.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const category = row.getValue("category") as BlogCategory;
      return (
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary">{category.category_name}</Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const category = row.getValue(id) as BlogCategory;
      return value.includes(category.category_name);
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <DataTableRowActions
        row={row}
        onSuccess={() => (table.options.meta as TableMeta<Blog>).refreshData()}
      />
    ),
  },
];

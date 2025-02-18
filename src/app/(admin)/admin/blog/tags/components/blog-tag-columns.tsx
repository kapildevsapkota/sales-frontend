"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BlogTag } from "@/types/blog";
import { DataTableColumnHeader } from "./blog-tag-data-table-column-header";
import { TableMeta } from "./blog-tag-data-table";
import { DataTableRowActions } from "./blog-tag-data-table-row-actions";

export const columns: ColumnDef<BlogTag>[] = [
  {
    accessorKey: "tag_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tag Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex max-w-[500px] items-center">
          <span className="truncate font-medium">
            {row.getValue("tag_name")}
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
          (table.options.meta as TableMeta<BlogTag>).refreshData()
        }
      />
    ),
  },
];

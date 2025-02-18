"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TeamMember } from "@/types/team";
import Image from "next/image";
import { DataTableColumnHeader } from "./team-data-table-column-header";
import { DataTableRowActions } from "./team-data-table-row-actions";
import { TableMeta } from "./team-data-table";

export const columns: ColumnDef<TeamMember>[] = [
  {
    accessorKey: "profile_picture",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const image = row.getValue("profile_picture") as string;
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
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">{row.getValue("role")}</div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">
          {row.getValue("email") || "-"}
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
          (table.options.meta as TableMeta<TeamMember>).refreshData()
        }
      />
    ),
  },
];

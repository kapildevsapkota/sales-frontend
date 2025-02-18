"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Enquiry } from "@/types/enquiries";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./enquiries-data-table-column-header";
import { DataTableRowActions } from "./enquiries-data-table-row-actions";
import { format } from "date-fns";

export const columns: ColumnDef<Enquiry>[] = [
  {
    accessorKey: "inquiry_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("inquiry_type") as string;
      return (
        <Badge variant={type === "General Inquiry" ? "secondary" : "default"}>
          {type}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "phone_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
  },
  {
    accessorKey: "submitted_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted At" />
    ),
    cell: ({ row }) => {
      return format(new Date(row.getValue("submitted_at")), "PPp");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

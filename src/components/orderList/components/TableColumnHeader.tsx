"use client";

import type React from "react";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import type { Column, SortDirection } from "@/types/sale";

interface TableColumnHeaderProps {
  column: Column;
  sortField: string | null;
  sortDirection: SortDirection;
  onSort: (columnId: string) => void;
  onResizeStart: (
    e: React.MouseEvent,
    columnId: string,
    initialWidth: number
  ) => void;
}

export function TableColumnHeader({
  column,
  sortField,
  sortDirection,
  onSort,
  onResizeStart,
}: TableColumnHeaderProps) {
  // Get sort icon based on current sort state
  const getSortIcon = (columnId: string) => {
    if (sortField !== columnId)
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4 ml-1" />;
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4 ml-1" />;
    return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
  };

  return (
    <TableHead
      className={`border p-2 text-left relative top-0 bg-white z-10 ${
        column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
      }`}
      style={{
        width: `${column.width}px`,
        minWidth: `${column.width}px`,
      }}
      onClick={() => column.sortable && onSort(column.id)}
    >
      <div className="flex items-center justify-between">
        <span>{column.label}</span>
        {column.sortable && (
          <span className="flex items-center">{getSortIcon(column.id)}</span>
        )}
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize group"
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, column.id, column.width);
          }}
        >
          <div className="absolute right-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-400"></div>
        </div>
      </div>
    </TableHead>
  );
}

"use client";

import { TableHead } from "@/components/ui/table";
import type { Column } from "@/types/sale";

interface TableColumnHeaderProps {
  column: Column;
}

export function TableColumnHeader({ column }: TableColumnHeaderProps) {
  return (
    <TableHead
      className={`border p-2 text-left relative top-0 bg-white z-10`}
      style={{
        width: `${column.width}px`,
        minWidth: `${column.width}px`,
      }}
    >
      <div className="flex items-center justify-between">
        <span>{column.label}</span>
      </div>
    </TableHead>
  );
}

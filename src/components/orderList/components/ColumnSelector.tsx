"use client";

import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column } from "@/types/sale";

interface ColumnSelectorProps {
  columns: Column[];
  toggleColumnVisibility: (columnId: string) => void;
  showAllColumns: () => void;
  hideAllColumns: () => void;
}

export function ColumnSelector({
  columns,
  toggleColumnVisibility,
  showAllColumns,
  hideAllColumns,
}: ColumnSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full md:w-auto">
          Columns <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.visible}
              onCheckedChange={() => toggleColumnVisibility(column.id)}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="flex justify-between p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={showAllColumns}
            className="w-[48%]"
          >
            <Eye className="mr-1 h-4 w-4" />
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={hideAllColumns}
            className="w-[48%]"
          >
            <EyeOff className="mr-1 h-4 w-4" />
            None
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

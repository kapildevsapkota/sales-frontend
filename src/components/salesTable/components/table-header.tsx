"use client";
import { Search, ChevronDown, Eye, EyeOff } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column } from "@/types/sale";

// Adjust the path as necessary

interface TableHeaderProps {
  columns: Column[];
  toggleColumnVisibility: (columnId: string) => void;
  showAllColumns: () => void;
  hideAllColumns: () => void;
  salesCount: number;
  resultsCount: number;
  searchInput: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSearchInput: (value: string) => void;
  setFilterTerm: (value: string) => void;
  fetchSales: (page: number) => void;
  showFilterForm: boolean;
  setShowFilterForm: (value: boolean) => void;
  setShowExportModal: (value: boolean) => void;
}

export function TableHeader({
  columns,
  toggleColumnVisibility,
  showAllColumns,
  hideAllColumns,
  salesCount,
  resultsCount,
  searchInput,
  handleSearchInputChange,
  setSearchInput,
  setFilterTerm,
  fetchSales,
  setShowExportModal,
}: TableHeaderProps) {
  // Use the hook to get setShowFilterForm

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
      <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-normal">
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
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {resultsCount ? `${resultsCount} of ${salesCount} entries` : ""}
          </div>
        </div>
        <div className="relative w-full md:max-w-xl">
          <div className="flex flex-col md:flex-row items-center gap-2 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search sales..."
                className="pl-10 pr-10 h-10 w-full rounded-md border border-gray-300"
                value={searchInput}
                onChange={handleSearchInputChange}
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => {
                    setSearchInput("");
                    setFilterTerm("");
                    fetchSales(1);
                  }}
                ></Button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 whitespace-nowrap w-full md:w-auto"
              onClick={() => setShowExportModal(true)}
            >
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

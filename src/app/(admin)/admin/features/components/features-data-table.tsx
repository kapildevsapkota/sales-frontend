"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  TableMeta as BaseTableMeta,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./features-data-table-pagination";
import { DataTableToolbar } from "./features-data-table-toolbar";
import { FeaturesTableSkeleton } from "@/components/skeletons/features-table-skeleton";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image"; 

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDataChange?: () => void;
  isLoading?: boolean;
  onGlobalSearch?: (searchTerm: string) => void;
  pagination?: {
    pageCount: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export interface TableMeta<TData> extends BaseTableMeta<TData> {
  refreshData: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDataChange,
  isLoading,
  onGlobalSearch,
  pagination,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: (pagination?.currentPage || 1) - 1,
        pageSize: pagination?.pageSize || 10,
      },
    },
    meta: {
      refreshData: async () => {
        if (onDataChange) {
          onDataChange();
        }
      },
    } as TableMeta<TData>,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: pagination?.pageCount || 1,
  });

  const handleReset = () => {
    table.resetColumnFilters();
    if (onDataChange) {
      onDataChange();
    }
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} onReset={handleReset} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <FeaturesTableSkeleton />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.id === "image" ? (
                        <Image
                          src={cell.getValue() as string}
                          alt="Feature Image"
                          width={50}
                          height={50}
                          className="rounded-md"
                        />
                      ) : (
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p>No results.</p>
                    {table.getState().columnFilters.length > 0 &&
                      onGlobalSearch && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            onGlobalSearch(
                              (table
                                .getColumn("name")
                                ?.getFilterValue() as string) ?? ""
                            )
                          }
                          className="h-8 px-2 lg:px-3"
                        >
                          Search All Features
                          <Search className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <DataTablePagination
          table={table}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
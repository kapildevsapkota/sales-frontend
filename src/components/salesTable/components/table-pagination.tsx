"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  fetchSales: (page: number) => void;
}

export function TablePagination({
  currentPage,
  pageSize,
  totalCount,
  hasNext,
  fetchSales,
}: TablePaginationProps) {
  return (
    <div className="mt-4 flex flex-col md:flex-row justify-end items-center gap-2">
      <span className="text-sm text-gray-600 whitespace-nowrap">
        Page {currentPage} of {Math.ceil(totalCount / pageSize)}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => currentPage > 1 && fetchSales(currentPage - 1)}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => hasNext && fetchSales(currentPage + 1)}
          disabled={!hasNext}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

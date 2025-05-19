"use client";
import { Button } from "@/components/ui/button";

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
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => hasNext && fetchSales(currentPage + 1)}
          disabled={!hasNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

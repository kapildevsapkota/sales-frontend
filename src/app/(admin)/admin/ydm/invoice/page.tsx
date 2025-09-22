"use client";

import type {
  Invoice,
  PaginatedInvoiceResponse,
  InvoiceFilters,
} from "@/types/invoice";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { InvoiceTable } from "./components/invoice-table";

async function getInvoices(
  filters?: InvoiceFilters
): Promise<PaginatedInvoiceResponse> {
  const base = `${process.env.NEXT_PUBLIC_API_URL}/api/logistics/invoice/`;
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.pageSize) params.append("page_size", String(filters.pageSize));
  if (filters?.status && filters.status !== "all")
    params.append("status", filters.status);
  if (filters?.isApproved && filters.isApproved !== "all")
    params.append("is_approved", filters.isApproved);
  if (filters?.franchise) params.append("franchise", String(filters.franchise));

  const url = params.toString() ? `${base}?${params.toString()}` : base;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${text || "Failed to get invoices"}`
    );
  }
  return response.json();
}

function useGetInvoices(filters: InvoiceFilters) {
  const [data, setData] = useState<PaginatedInvoiceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading((prev) => (!data ? true : prev));
        setIsRefetching(!!data);
        const res = await getInvoices(filters);
        if (!isCancelled) {
          setData(res);
          setError(null);
        }
      } catch (e) {
        if (!isCancelled) {
          setError(e as Error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          setIsRefetching(false);
        }
      }
    };
    fetchData();
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.isApproved,
    filters.franchise,
    refreshTrigger,
  ]);

  const refresh = () => setRefreshTrigger((prev) => prev + 1);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    isRefetching,
    refresh,
  } as const;
}

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string | undefined;
  const franchiseId = useMemo(
    () => (idParam ? parseInt(idParam) : undefined),
    [idParam]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [status, setStatus] = useState<string>("all");
  const [isApproved, setIsApproved] = useState<string>("all");

  const { data, isLoading, isError, error, isRefetching, refresh } =
    useGetInvoices({
      page: currentPage,
      pageSize,
      status,
      isApproved,
      franchise: franchiseId,
    });

  const invoices = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4 mx-auto max-w-7xl">
      {isError ? (
        <div className="text-red-600 text-sm">
          {(error as Error)?.message || "Failed to load invoices"}
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          Showing {invoices.length} of {totalCount} invoices
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-center">
          <Select
            value={status}
            onValueChange={(v) => {
              setCurrentPage(1);
              setStatus(v);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={isApproved}
            onValueChange={(v) => {
              setCurrentPage(1);
              setIsApproved(v);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Approval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Approval</SelectItem>
              <SelectItem value="true">Approved</SelectItem>
              <SelectItem value="false">Not Approved</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setStatus("all");
                setIsApproved("all");
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading || isRefetching}
        onRefresh={refresh}
      />

      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between py-3 border-t">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalCount} total invoices)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

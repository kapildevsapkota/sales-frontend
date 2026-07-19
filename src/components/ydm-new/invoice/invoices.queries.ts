import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  getInvoiceComments,
  commentOnInvoice,
  getPendingCod,
  type Invoice,
  type InvoiceComment,
} from "./invoices";

// ---------- Query Keys ----------

export const INVOICES_QUERY_KEYS = {
  all: ["invoices"] as const,
  detail: (id: number) => [...INVOICES_QUERY_KEYS.all, "detail", id] as const,
  comments: (id: number) =>
    [...INVOICES_QUERY_KEYS.detail(id), "comments"] as const,
  pendingCod: ["pendingCod"] as const,
};

// ---------- Helpers ----------

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "detail" in error) {
    return String((error as { detail: unknown }).detail);
  }
  return fallback;
}

// ---------- Hooks ----------

export function usePendingCod() {
  return useQuery({
    queryKey: INVOICES_QUERY_KEYS.pendingCod,
    queryFn: () => getPendingCod(),
  });
}

export function useVendorInvoices() {
  return useQuery({
    queryKey: INVOICES_QUERY_KEYS.all,
    queryFn: () => getInvoices(),
  });
}

export function useGetInvoiceById(id: number) {
  return useQuery({
    queryKey: INVOICES_QUERY_KEYS.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createInvoice(data),
    onSuccess: () => {
      toast.success("Invoice created successfully");
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEYS.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create invoice"));
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      invoice,
    }: {
      id: number;
      invoice: Record<string, unknown>;
    }) => updateInvoice(id, invoice),
    onSuccess: () => {
      toast.success("Invoice updated successfully");
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEYS.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update invoice"));
    },
  });
}

/**
 * Approves an invoice via PATCH /api/invoices/:id/ with { is_approved: true }.
 * Kept separate from useUpdateInvoice so the approve action gets its own
 * loading state and toast copy, without callers needing to pass a payload.
 */
export function useApproveInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => updateInvoice(id, { is_approved: true }),
    onSuccess: (_data: Invoice, id: number) => {
      toast.success("Invoice approved successfully");
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: INVOICES_QUERY_KEYS.detail(id),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to approve invoice"));
    },
  });
}

export function useGetInvoiceComments(id: number) {
  return useQuery({
    queryKey: INVOICES_QUERY_KEYS.comments(id),
    queryFn: () => getInvoiceComments(id),
    enabled: !!id,
  });
}

export function useCommentOnInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      commentOnInvoice(id, comment),
    onSuccess: (_data: InvoiceComment, variables: { id: number; comment: string }) => {
      toast.success("Comment added successfully");
      queryClient.invalidateQueries({
        queryKey: INVOICES_QUERY_KEYS.comments(variables.id),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add comment"));
    },
  });
}

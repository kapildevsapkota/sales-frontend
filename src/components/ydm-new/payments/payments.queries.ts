import {
  getPaymentOrders,
  type GetPaymentOrdersParams,
  getCodPayments,
  type GetCodPaymentsParams,
  getUnpaidOrders,
  createCodTransfer,
  getCodPaymentDetail,
  deleteCodTransfer,
  updateCodTransfer,
} from "./payments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const PAYMENTS_QUERY_KEYS = {
  all: ["payments"] as const,
  list: (params?: GetPaymentOrdersParams) => ["payments", "list", params] as const,
  codPayments: (params?: GetCodPaymentsParams) => ["payments", "cod", params] as const,
  unpaidOrders: (page: number, search: string, start_date?: string, end_date?: string) =>
    ["payments", "unpaid-orders", page, search, start_date, end_date] as const,
  codPaymentDetail: (paymentId: string | number) =>
    ["payments", "cod-detail", paymentId] as const,
};

export function useVendorPaymentOrders(
  params?: GetPaymentOrdersParams,
) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.list(params),
    queryFn: () => getPaymentOrders(params),
  });
}

export function useVendorCodPayments(
  params?: GetCodPaymentsParams,
) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.codPayments(params),
    queryFn: () => getCodPayments(params),
  });
}

export function useUnpaidOrders(
  page: number = 1,
  search: string = "",
  start_date?: string,
  end_date?: string,
) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.unpaidOrders(page, search, start_date, end_date),
    queryFn: () => getUnpaidOrders(page, search, start_date, end_date),
  });
}

export function useCreateCodTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      orders: number[];
      total_amount: number;
      delivery_amount?: number;
    }) => createCodTransfer(payload),
    onSuccess: () => {
      toast.success("COD Transfer created successfully");
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || error?.detail || "Failed to create COD Transfer",
      );
    },
  });
}

export function useCodPaymentDetail(paymentId: string | number) {
  return useQuery({
    queryKey: PAYMENTS_QUERY_KEYS.codPaymentDetail(paymentId),
    queryFn: () => getCodPaymentDetail(paymentId),
    enabled: !!paymentId,
  });
}

export function useDeleteCodTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string | number) => deleteCodTransfer(paymentId),
    onSuccess: () => {
      toast.success("COD Transfer deleted successfully");
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || error?.detail || "Failed to delete COD Transfer",
      );
    },
  });
}

export function useUpdateCodTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      status,
    }: {
      paymentId: string | number;
      status: string;
    }) => updateCodTransfer(paymentId, { status }),
    onSuccess: () => {
      toast.success("COD Transfer status updated successfully");
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEYS.all });
    },
    onError: (error: any) => {
      toast.error(
        error?.message || error?.detail || "Failed to update COD Transfer",
      );
    },
  });
}

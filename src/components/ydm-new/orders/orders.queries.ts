import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOrdersByVendor,
  getOrderDetailsByVendor,
  updateOrderDetails,
  type UpdateOrderPayload,
} from "./orders";

// ---------- Query Keys ----------

export const ORDERS_QUERY_KEYS = {
  all: ["orders"] as const,
  list: (
    page: number,
    pageSize: number,
    search: string,
    status: string,
    deliveryLocationType: string,
    startDate: string,
    endDate: string,
  ) =>
    [
      ...ORDERS_QUERY_KEYS.all,
      "list",
      page,
      pageSize,
      search,
      status,
      deliveryLocationType,
      startDate,
      endDate,
    ] as const,
  detail: (trackingNumber: string) =>
    [...ORDERS_QUERY_KEYS.all, "detail", trackingNumber] as const,
};

// ---------- Hooks ----------

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useVendorOrders(
  page: number = 1,
  pageSize: number = 50,
  search: string = "",
  status: string = "",
  deliveryLocationType: string = "",
  startDate: string = "",
  endDate: string = "",
) {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.list(
      page,
      pageSize,
      search,
      status,
      deliveryLocationType,
      startDate,
      endDate,
    ),
    queryFn: () =>
      getOrdersByVendor(
        page,
        pageSize,
        search,
        status,
        deliveryLocationType,
        startDate,
        endDate,
      ),
    placeholderData: (prev) => prev,
  });
}

export function useOrderDetails(trackingNumber: string | undefined) {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.detail(trackingNumber ?? ""),
    queryFn: () => getOrderDetailsByVendor(trackingNumber!),
    enabled: !!trackingNumber,
  });
}

export function useUpdateOrderDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trackingNumber,
      data,
    }: {
      trackingNumber: string;
      data: UpdateOrderPayload;
    }) => updateOrderDetails(trackingNumber, data),
    onSuccess: (_data, { trackingNumber }) => {
      toast.success("Order updated successfully");
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ORDERS_QUERY_KEYS.detail(trackingNumber),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update order"));
    },
  });
}

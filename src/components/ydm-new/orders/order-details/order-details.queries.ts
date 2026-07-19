import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrderDetailsByVendor, postOrderComment } from "../orders";
import { ORDERS_QUERY_KEYS } from "../orders.queries";

export function useOrderDetails(trackingNumber: string | undefined) {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.detail(trackingNumber ?? ""),
    queryFn: () => getOrderDetailsByVendor(trackingNumber!),
    enabled: !!trackingNumber,
  });
}

export function usePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      trackingNumber,
      comment,
    }: {
      trackingNumber: string;
      comment: string;
    }) => postOrderComment(trackingNumber, comment),
    onSuccess: (_data, { trackingNumber }) => {
      toast.success("Comment posted successfully");
      queryClient.invalidateQueries({
        queryKey: ORDERS_QUERY_KEYS.detail(trackingNumber),
      });
    },
    onError: () => {
      toast.error("Failed to post comment. Please try again.");
    },
  });
}

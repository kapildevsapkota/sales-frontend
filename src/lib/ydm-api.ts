import {
  SalesResponse,
  YDMRiderOrderFilters,
} from "@/types/ydm-dashboard/ydm-orders";
import type {
  OrderData,
  OrderTrackingResponse,
  ApiResponse as TrackingApiResponse,
} from "@/types/ydm-dashboard/tracking";
import type {
  OrderComment,
  CreateOrderCommentRequest,
  ApiResponse as CommentsApiResponse,
} from "@/types/ydm-dashboard/comments";

export class YDMApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  }

  static async get(
    id: number,
    filters?: YDMRiderOrderFilters
  ): Promise<SalesResponse> {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    // Build URL with base parameters
    const params = new URLSearchParams();
    params.append("franchise", id.toString());

    if (filters?.page) {
      params.append("page", filters.page.toString());
    }

    if (filters?.pageSize) {
      params.append("page_size", filters.pageSize.toString());
    }

    // Add search parameter if present
    if (filters?.search) {
      params.append("search", filters.search);
    }

    // Add order_status parameter if selected
    if (filters?.orderStatus && filters.orderStatus !== "all") {
      params.append("order_status", filters.orderStatus);
    }

    // Add delivery_type parameter if selected
    if (filters?.deliveryType && filters.deliveryType !== "all") {
      params.append("delivery_type", filters.deliveryType);
    }

    // Add is_assigned parameter if selected
    if (filters?.isAssigned && filters.isAssigned !== "all") {
      params.append("is_assigned", filters.isAssigned);
    }

    // Add date range parameters
    if (filters?.startDate) {
      params.append("start_date", filters.startDate);
    }

    if (filters?.endDate) {
      params.append("end_date", filters.endDate);
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const url = `${baseURL}/api/sales/orders/?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${text || "Failed to fetch YDM orders"}`
      );
    }

    const json = await response.json();
    return json as SalesResponse;
  }
}

export const ydmApiService = new YDMApiService();

// ----------------------
// Tracking and Comments
// ----------------------

/**
 * Universal tracking API - handles order tracking by code
 */
export class OrderTrackingAPI {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";

  static async trackAny(
    trackingCode: string
  ): Promise<TrackingApiResponse<OrderData>> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/track-order/?order_code=${encodeURIComponent(
          trackingCode
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            data: {} as OrderData,
            success: false,
            message: "Order not found with the provided tracking code",
            error: "Order not found",
          } as TrackingApiResponse<OrderData>;
        } else if (response.status >= 500) {
          return {
            data: {} as OrderData,
            success: false,
            message: "Server error. Please try again later.",
            error: "Server error",
          } as TrackingApiResponse<OrderData>;
        } else {
          return {
            data: {} as OrderData,
            success: false,
            message:
              "Failed to track order. Please check your tracking code and try again.",
            error: `HTTP ${response.status}`,
          } as TrackingApiResponse<OrderData>;
        }
      }

      const responseData: OrderTrackingResponse = await response.json();

      if (!responseData.order || !responseData.order.id) {
        return {
          data: {} as OrderData,
          success: false,
          message: "Order not found with the provided tracking code",
          error: "Order not found",
        } as TrackingApiResponse<OrderData>;
      }

      const orderData: OrderData = {
        ...responseData.order,
        order_change_log: responseData.order_change_log,
        order_comment: responseData.order_comment,
      } as OrderData;

      return {
        data: orderData,
        success: true,
      } as TrackingApiResponse<OrderData>;
    } catch (error) {
      // Network or parsing errors
      if (
        error instanceof TypeError &&
        (error as TypeError).message.includes("fetch")
      ) {
        return {
          data: {} as OrderData,
          success: false,
          message: "Network error. Please check your connection and try again.",
          error: "Network error",
        } as TrackingApiResponse<OrderData>;
      }

      return {
        data: {} as OrderData,
        success: false,
        message: "Order not found with the provided tracking code",
        error: error instanceof Error ? error.message : "Unknown error",
      } as TrackingApiResponse<OrderData>;
    }
  }
}

// Helpers for authenticated requests
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return response;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${errorText || "Request failed"}`
    );
  }

  return response;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const createOrderComment = async (
  commentData: CreateOrderCommentRequest
): Promise<OrderComment> => {
  const response = await fetch(`${API_BASE_URL}/api/logistics/order-comment/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(commentData),
  });

  await handleResponse(response);
  const data: CommentsApiResponse<OrderComment> | OrderComment =
    await response.json();
  if (data && typeof data === "object" && "data" in data) {
    return (data as CommentsApiResponse<OrderComment>).data as OrderComment;
  }
  return data as OrderComment;
};

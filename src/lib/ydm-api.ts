import {
  SalesResponse,
  YDMRiderOrderFilters,
} from "@/types/ydm-dashboard/ydm-orders";

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

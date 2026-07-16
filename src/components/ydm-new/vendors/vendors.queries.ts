import { useQuery } from "@tanstack/react-query";
import {
  getVendors,
  getVendorById,
  type GetVendorsParams,
} from "./vendors";
import {
  fetchVendorDashboardStats,
  fetchVendorDashboardPlacedStats,
  fetchVendorDashboardDeliveredStats,
  fetchVendorDashboardCompleteStats,
} from "./vendors.actions";

export const VENDORS_QUERY_KEYS = {
  all: ["vendors"] as const,
  lists: () => [...VENDORS_QUERY_KEYS.all, "list"] as const,
  list: (params: GetVendorsParams) =>
    [...VENDORS_QUERY_KEYS.lists(), params] as const,
  details: () => [...VENDORS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...VENDORS_QUERY_KEYS.details(), id] as const,
  dashboardStats: ["vendors", "dashboardStats"] as const,
  dashboardPlacedStats: ["vendors", "dashboardPlacedStats"] as const,
  dashboardDeliveredStats: ["vendors", "dashboardDeliveredStats"] as const,
  dashboardCompleteStats: ["vendors", "dashboardCompleteStats"] as const,
};

export function useVendors(params: GetVendorsParams = {}) {
  return useQuery({
    queryKey: VENDORS_QUERY_KEYS.list(params),
    queryFn: () => getVendors(params),
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: VENDORS_QUERY_KEYS.detail(id),
    queryFn: () => getVendorById(id),
    enabled: !!id,
  });
}

export function useVendorDashboardStats() {
  return useQuery({
    queryKey: VENDORS_QUERY_KEYS.dashboardStats,
    queryFn: () => fetchVendorDashboardStats(),
  });
}

export function useVendorDashboardPlacedStats() {
  return useQuery({
    queryKey: VENDORS_QUERY_KEYS.dashboardPlacedStats,
    queryFn: () => fetchVendorDashboardPlacedStats(),
  });
}

export function useVendorDashboardDeliveredStats() {
  return useQuery({
    queryKey: VENDORS_QUERY_KEYS.dashboardDeliveredStats,
    queryFn: () => fetchVendorDashboardDeliveredStats(),
  });
}

export function useVendorDashboardCompleteStats() {
  return useQuery({
    queryKey: VENDORS_QUERY_KEYS.dashboardCompleteStats,
    queryFn: () => fetchVendorDashboardCompleteStats(),
  });
}

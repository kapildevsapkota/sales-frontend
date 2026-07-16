import { api } from "@/lib/api";

export interface GetVendorsParams {
  search?: string;
}

export interface Vendor {
  id: number;
  name: string;
  slug?: string;
  contacts?: { name: string; phone: string }[];
}

export interface DashboardStat {
  status: string;
  key: string;
  nos: number;
  amount: number;
}

export interface VendorDashboardStats {
  order_processing: DashboardStat[];
  order_dispatched: DashboardStat[];
  order_status: DashboardStat[];
}

export interface VendorDailyPlacedStat {
  date: string;
  placed_count: number;
}

export interface VendorDailyDeliveredStat {
  date: string;
  delivered_count: number;
}

export interface TotalStats {
  nos: number;
  amount: number;
}

export interface VendorCompleteStat {
  overall_statistics: {
    total_order: TotalStats;
    total_cod: TotalStats;
    total_delivered: TotalStats;
    total_rtv: TotalStats;
    total_delivery_charge: TotalStats;
    total_cancellation_charge: TotalStats;
    total_pending_cod: TotalStats;
    last_cod_payment: string | null;
  };
  todays_statistics: {
    todays_orders: number;
    todays_delivery: number;
    todays_rescheduled: number;
    todays_cancellation: number;
  };
  delivery_performance: {
    delivered_percentage: number;
    cancelled_percentage: number;
  };
}

// ---------- Vendor list helpers (client-side, uses axios) ----------

export async function getVendors(params: GetVendorsParams = {}) {
  const search = params.search
    ? `?search=${encodeURIComponent(params.search)}`
    : "";
  return api.get<Vendor[]>(`/api/vendors/${search}`).then((r) => r.data);
}

export async function getVendorById(id: string) {
  return api.get<Vendor>(`/api/vendors/${id}/`).then((r) => r.data);
}

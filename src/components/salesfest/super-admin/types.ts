import { Statistics } from "@/components/dashboard/types";

export interface Franchise {
  id: number;
  name: string;
  short_form: string | null;
  distributor: number;
}

export interface ProductSale {
  product_name: string;
  quantity_sold: number;
}

export interface Salesperson {
  first_name: string;
  last_name: string;
  total_sales: number;
  sales_count: number;
  product_sales: ProductSale[];
}

export interface TopSalespersonsResponse {
  filter_type: "all" | "daily" | "weekly" | "monthly";
  results: Salesperson[];
}

export interface FranchiseStatsEntry {
  franchise: Franchise;
  statistics: Statistics;
}

export interface FranchiseSalesEntry {
  franchise: Franchise;
  statistics: Statistics | null;
  salespersons: Salesperson[];
}

export interface RankedSalesperson extends Salesperson {
  franchiseName: string;
  group: "A" | "B";
}

export interface RevenueTrendPoint {
  period: string;
  total_revenue: number;
  order_count: number;
}

export interface RevenueTrendResponse {
  data: RevenueTrendPoint[];
}

export type SalesFilter = "all" | "daily" | "weekly" | "monthly";
export type ViewTab = "overview" | "franchise" | "rankings";
export type FestGroup = "A" | "B";

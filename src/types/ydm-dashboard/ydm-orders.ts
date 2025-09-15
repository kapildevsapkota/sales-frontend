export interface Sale {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  delivery_type: string;
  order_status: string;
  created_at: string;
  total_amount: number;
  items: SaleItem[];
}

export interface YDMRiderOrderFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  orderStatus?: string;
  startDate?: string;
  endDate?: string;
  deliveryType?: string;
  isAssigned?: string;
}

export interface DashLocation {
  id: number;
  name: string;
  coverage_areas: string[];
}

export interface SaleItem {
  order_code: string;
  dash_tracking_code: string | null;
  dash_location_name: string | null;
  logistics_name: string;
  logistics: string;
  id: number;
  created_at: string;
  updated_at: string;
  full_name: string;
  delivery_address: string;
  city: string;
  landmark: string;
  phone_number: string;
  alternate_phone_number: string | null;
  remarks: string;
  order_products: OrderProduct[];
  total_amount: string;
  sales_person: SalesPerson;
  payment_method: string;
  payment_screenshot: string | null;
  delivery_charge: string;
  order_status: string;
  date: string;
  prepaid_amount: string | null;
  remaining_amount: number | null;
  delivery_type: string;
  ydm_rider?: string | null;
  promo_code?: string | null;
  ydm_rider_name?: string | null;
}

interface OrderProduct {
  id: number;
  product: Product;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
}
interface FranchiseContact {
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface SalesPerson {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  franchise: string;
  distributor: string;
  factory: string;
  franchise_contact_numbers: FranchiseContact[];
}

export interface SalesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SaleItem[];
}
export interface Column {
  id: string;
  label: string;
  visible: boolean;
  width: number;
}

export type SortDirection = "asc" | "desc" | null;

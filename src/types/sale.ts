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

export interface DashLocation {
  id: number;
  name: string;
  coverage_areas: string[];
}

export interface SaleItem {
  order_code: string;
  dash_tracking_code: string;
  dash_location_name: string;
  logistics_name: string;
  logistics: string | null;
  id: number;
  created_at: string;
  full_name: string;
  delivery_address: string;
  city: string;
  phone_number: string;
  remarks: string;
  order_products: OrderProduct[];
  total_amount: string;
  sales_person: SalesPerson;
  payment_method: string;
  payment_screenshot: string;
  delivery_charge: string;
  order_status: string;
  prepaid_amount: number | null;
  remaining_amount: number | null;
  alternate_phone_number: string | null;
  delivery_type: string;
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

interface SalesPerson {
  id: number;
  first_name: string;
  last_name: string;
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

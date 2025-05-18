export interface SaleItem {
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
  sortable: boolean;
}

export type SortDirection = "asc" | "desc" | null;

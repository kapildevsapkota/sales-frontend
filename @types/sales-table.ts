export interface SaleItem {
  id: number;
  full_name: string;
  city: string;
  delivery_address: string;
  alternate_phone_number: string;
  phone_number: string;
  remarks: string;
  order_products: {
    id: number;
    product: {
      id: number;
      name: string;
    };
    quantity: number;
  }[];
  total_amount: string;
  sales_person: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    distributor: string;
    franchise: string;
  };
  payment_method: string;
  payment_screenshot: string | null;
  delivery_charge: string;
  date: string;
  order_status: string;
  created_at: string;
  updated_at: string;
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
export interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
}

export interface OrderProduct {
  id: number;
  product: Product;
  quantity: number;
  discount: string;
  get_total_price: number;
}

export interface SalesPerson {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
}

export interface Sale {
  id: number;
  full_name: string;
  city: string;
  delivery_address: string;
  delivery_charge: string;
  order_products: OrderProduct[];
  order_status: string;
  payment_method: string;
  phone_number: string;
  total_amount: string;
  sales_person: SalesPerson;
  created_at: string;
  updated_at: string;
}

export interface SalesResponse {
  count: number;
  next: null | string;
  previous: null | string;
  results: Sale[];
} 
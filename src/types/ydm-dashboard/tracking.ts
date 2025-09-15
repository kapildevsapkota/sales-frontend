export interface Product {
  id: number;
  name: string;
}

export interface OrderProduct {
  id: number;
  product: Product;
  quantity: number;
}

export interface SalesPerson {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  franchise: string;
  distributor: string;
  factory: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  franchise: string | null;
}

export interface OrderChangeLog {
  id: number;
  user: User;
  old_status: string;
  new_status: string;
  comment: string | null;
  changed_at: string;
  order: number;
}

export interface OrderComment {
  id: number;
  user: User;
  comment: string;
  created_at: string;
  updated_at: string;
  order: number;
}

export interface TrackingEvent {
  date: string;
  activity: string;
  activity_by: string;
  location: string;
  reason: string;
  remarks: string;
}

export interface OrderData {
  id: number;
  order_code: string;
  sales_person: SalesPerson;
  full_name: string;
  city: string;
  delivery_address: string;
  landmark: string;
  phone_number: string;

  alternate_phone_number: string;
  payment_method: string;
  payment_screenshot: string | null;
  order_status: string;
  date: string;
  created_at: string;
  updated_at: string;
  order_products: OrderProduct[];
  total_amount: string;
  delivery_charge: string;
  remarks: string;
  promo_code: string | null;
  prepaid_amount: string;
  delivery_type: string;
  logistics: string;
  dash_location_name: string | null;
  dash_tracking_code: string | null;
  tracking_history?: TrackingEvent[];
  order_change_log?: OrderChangeLog[];
  order_comment?: OrderComment[];
}

export interface OrderTrackingResponse {
  order: OrderData;
  order_change_log: OrderChangeLog[];
  order_comment: OrderComment[];
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface TrackingState {
  data: OrderData | null;
  loading: boolean;
  error: string | null;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type PaymentMethod =
  | "Cash on Delivery"
  | "Online Payment"
  | "Bank Transfer"
  | "Mobile Payment";

export type DeliveryType =
  | "Inside valley"
  | "Outside valley"
  | "Express delivery";

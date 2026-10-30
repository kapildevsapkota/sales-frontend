export interface OfflineSalesAccessRecord {
  id: number;
  user: number;
  user_id: number;
  user_name: string;
  user_username: string;
  user_email: string;
  user_phone: string;
  user_role: string;
  granted_by: number;
  granted_by_name: string;
  granted_at: string;
}

export interface OfflineOrderItem {
  id: number;
  inventory: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  quantity: number;
}

export interface OfflineOrder {
  id: number;
  order_code: string;
  customer: number;
  customer_name: string;
  customer_contact_person: string;
  customer_phone: string;
  franchise: number;
  franchise_name: string;
  sales_person: number;
  sales_person_name: string;
  order_date: string;
  order_status: string;
  payment_status: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  items_count: number;
  remarks: string | null;
  items: OfflineOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OfflineOrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OfflineOrder[];
}

export interface OfflineCustomer {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  address?: string;
  franchise_id?: number;
  franchise_name?: string;
  total_orders?: number;
  total_spent?: number;
  remaining_balance?: number;
  last_order_date?: string;
  is_active?: boolean;
}

export interface OfflineAttendance {
  id: number;
  sales_person_id: number;
  sales_person_name: string;
  franchise_name: string;
  phone: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: "Present" | "On Field" | "Late" | "Absent" | "Half Day";
  working_hours?: string;
  location?: string;
  remarks?: string;
}

export interface OfflineSalesConfig {
  orders_enabled: boolean;
  order_code_prefix: string;
  allow_partial_payment: boolean;
  min_partial_percentage: number;
  require_customer_phone: boolean;
  auto_delivered_on_full_payment: boolean;
  default_commission_rate: number;
  monthly_target_amount: number;
  gps_tracking_required: boolean;
  geofence_radius_meters: number;
  allow_offline_sync: boolean;
}


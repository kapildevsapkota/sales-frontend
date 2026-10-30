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
  store_name: string;
  contact_person: string;
  phone_number: string;
  address: string;
  franchise: number;
  franchise_name: string;
  sales_person: number;
  sales_person_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_orders_count: number;
  total_purchased_amount: number;
  total_paid_amount: number;
  total_remaining_amount: number;
}

export interface OfflineCustomersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OfflineCustomer[];
}

export interface OfflineAttendance {
  id: number;
  sales_person: number;
  sales_person_name: string;
  image: string | null;
  attendance_date: string;
  attendance_time: string;
  attendance_location: string;
  attendance_lat: string;
  attendance_long: string;
}

export interface OfflineAttendanceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OfflineAttendance[];
}

export interface OfflineAttendanceConfig {
  id: number;
  cutoff_time: string;
  updated_by: number;
  updated_by_name: string;
  updated_at: string;
  created_at: string;
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


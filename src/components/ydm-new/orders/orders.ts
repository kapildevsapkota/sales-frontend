import { BASE_URL, getYdmApiKey, buildHeaders, downloadFile } from "../config";

// ---------- Types ----------

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ChangeLog {
  old_status: string;
  new_status: string;
  comment: string;
  changed_at: string;
  user: number;
  user_name: string;
}

export interface Comment {
  id: number;
  commented_by: number;
  commented_by_name: string;
  commented_by_role: string;
  message: string;
  created_at: string;
}

export interface Product {
  name: string;
  quantity: number;
}

export interface Order {
  tracking_number: string;
  external_order_code: string;
  project_client: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_email: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  recipient_address: string;
  recipient_city: string;
  recipient_district: string | null;
  cod_amount: string;
  delivery_charge: string;
  payment_type: string;
  product: Product[] | string;
  special_instructions: string;
  status: string;
  remarks: string;
  pickup_date: string | null;
  delivered_at: string | null;
  delivery_attempts: number;
  assigned_rider: number | null;
  assigned_rider_name: string;
  created_at: string;
  updated_at: string;
  change_logs: ChangeLog[];
  comments: Comment[];
  delivery_location_type?: string | null;
  is_rider_verified?: boolean;
}

export interface UpdateOrderStatusPayload {
  status: string;
  comment?: string;
}

export interface UpdateOrderPayload {
  recipient_name?: string;
  recipient_phone?: string;
  recipient_email?: string;
  recipient_address?: string;
  recipient_city?: string;
  recipient_district?: string;
  cod_amount?: string;
  delivery_charge?: string;
  payment_type?: string;
  special_instructions?: string;
  remarks?: string;
}

// ---------- API ----------

export async function getOrdersByVendor(
  page: number = 1,
  pageSize: number = 50,
  search: string = "",
  status: string = "",
  deliveryLocationType: string = "",
  startDate: string = "",
  endDate: string = "",
): Promise<PaginatedResponse<Order>> {
  const apiKey = await getYdmApiKey();
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (deliveryLocationType) params.set("delivery_location_type", deliveryLocationType);
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const res = await fetch(`${BASE_URL}/api/orders/?${params.toString()}`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
  return res.json() as Promise<PaginatedResponse<Order>>;
}

export async function getOrderDetailsByVendor(
  tracking_number: string,
): Promise<Order> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/orders/${tracking_number}/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Failed to fetch order ${tracking_number}: ${res.status}`);
  return res.json() as Promise<Order>;
}

export async function postOrderComment(
  tracking_number: string,
  message: string,
): Promise<unknown> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/orders/${tracking_number}/comments/`, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Failed to post comment: ${res.status}`);
  return res.json();
}

export async function exportOrders(
  search: string = "",
  status: string = "",
  deliveryLocationType: string = "",
  startDate: string = "",
  endDate: string = "",
): Promise<void> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (deliveryLocationType) params.set("delivery_location_type", deliveryLocationType);
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const query = params.toString();
  return downloadFile(`/api/orders/export/${query ? `?${query}` : ""}`, "orders-export.xlsx");
}

export async function updateOrderDetails(
  tracking_number: string,
  data: UpdateOrderPayload,
): Promise<Order> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/orders/${tracking_number}/`, {
    method: "PATCH",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update order ${tracking_number}: ${res.status}`);
  return res.json() as Promise<Order>;
}

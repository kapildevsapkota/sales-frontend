import { BASE_URL, getYdmApiKey, buildHeaders } from "../config";

export interface PaymentOrder {
  id: number;
  tracking_number: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod: string;
  delivery_charge: number;
  ydm_cancellation_charge: number | null;
  net_amount: number;
  payment_status: string;
  status?: string;
  cod_transferred?: string | number;
  balance?: string | number;
  returned?: string | number;
}

export interface GetPaymentOrdersParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface PaymentOrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PaymentOrder[];
}

export interface CodPayment {
  id: number;
  payment_number: string;
  transfer_date: string;
  order_count: number;
  delivery_amount?: string;
  amount: string;
  status: string;
}

export interface GetCodPaymentsParams {
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface CodPaymentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CodPayment[];
}

export interface CodPaymentOrderDetail {
  tracking_number: string;
  external_order_code: string | null;
  sender_name: string;
  sender_phone: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: string;
  recipient_district: string;
  cod_amount: string;
  delivery_charge: string;
  ydm_delivery_charge: string | null;
  ydm_cancelled_charge: string | null;
  net_amount: number;
  payment_type: string;
  status: string;
  assigned_rider: number | null;
  assigned_rider_name: string;
  is_rider_verified: boolean;
  created_at: string;
  latest_status_comment: string;
}

export interface CodPaymentDetail {
  id: number;
  payment_number: string;
  user: number;
  user_detail: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    role: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
  };
  created_by: number;
  created_by_detail: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    role: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
  };
  orders: number[];
  orders_detail: CodPaymentOrderDetail[];
  total_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getPaymentOrders(
  params?: GetPaymentOrdersParams,
): Promise<PaymentOrdersResponse> {
  const apiKey = await getYdmApiKey();
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  const res = await fetch(`${BASE_URL}/api/payment/orders/?${query.toString()}`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Failed to fetch payment orders: ${res.status}`);
  return res.json() as Promise<PaymentOrdersResponse>;
}

export async function getCodPayments(
  params?: GetCodPaymentsParams,
): Promise<CodPaymentsResponse> {
  const apiKey = await getYdmApiKey();
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);

  const res = await fetch(`${BASE_URL}/api/payment/?${query.toString()}`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Failed to fetch COD payments: ${res.status}`);
  return res.json() as Promise<CodPaymentsResponse>;
}

export async function getUnpaidOrders(
  page: number = 1,
  search: string = "",
  start_date?: string,
  end_date?: string,
): Promise<PaymentOrdersResponse> {
  const apiKey = await getYdmApiKey();
  const query = new URLSearchParams({
    page: String(page),
  });
  if (search) query.set("search", search);
  if (start_date) query.set("start_date", start_date);
  if (end_date) query.set("end_date", end_date);

  const res = await fetch(`${BASE_URL}/api/payment/unpaid-orders/?${query.toString()}`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Failed to fetch unpaid orders: ${res.status}`);
  return res.json() as Promise<PaymentOrdersResponse>;
}

export async function createCodTransfer(payload: {
  orders: number[];
  total_amount: number;
  delivery_amount?: number;
}): Promise<any> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/payment/`, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create COD transfer: ${res.status}`);
  return res.json();
}

export async function getCodPaymentDetail(
  paymentId: string | number,
): Promise<CodPaymentDetail> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/payment/${paymentId}/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Failed to fetch COD payment detail: ${res.status}`);
  return res.json() as Promise<CodPaymentDetail>;
}

export async function deleteCodTransfer(
  paymentId: string | number,
): Promise<void> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/payment/${paymentId}/`, {
    method: "DELETE",
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) throw new Error(`Failed to delete COD transfer: ${res.status}`);
}

export async function updateCodTransfer(
  paymentId: string | number,
  data: Partial<CodPayment>,
): Promise<CodPayment> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/payment/${paymentId}/`, {
    method: "PATCH",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update COD transfer: ${res.status}`);
  return res.json() as Promise<CodPayment>;
}

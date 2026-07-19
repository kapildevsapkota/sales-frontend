import { BASE_URL, getYdmApiKey, buildHeaders } from "../config";

// ---------- Types ----------

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Invoice {
  id: number;
  invoice_code: string | null;
  total_amount: string | null;
  paid_amount: string | null;
  due_amount: string | null;
  payment_type: "Cash" | "Bank Transfer" | "Cheque";
  status: "Draft" | "Partially Paid" | "Pending" | "Paid";
  is_approved: boolean;
  approved_at: string | null;
  signature: string | null;
  created_at: string;
  updated_at: string;
  user_detail?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    address: string | null;
    role: string;
  };
  created_by: number | null;
  approved_by: number | null;
}

export interface InvoiceComment {
  id: number;
  comment: string;
  created_at: string;
  created_by: number | null;
}

// ---------- Invoice API ----------

export async function getInvoices(): Promise<PaginatedResponse<Invoice>> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/invoices/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch invoices: ${res.status}`);
  }
  return res.json() as Promise<PaginatedResponse<Invoice>>;
}

export async function getInvoiceById(id: number): Promise<Invoice> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/invoices/${id}/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch invoice ${id}: ${res.status}`);
  }
  return res.json() as Promise<Invoice>;
}

export async function createInvoice(
  data: Record<string, unknown>,
): Promise<Invoice> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/invoices/`, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to create invoice: ${res.status}`);
  }
  return res.json() as Promise<Invoice>;
}

export async function updateInvoice(
  id: number,
  data: Record<string, unknown>,
): Promise<Invoice> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/invoices/${id}/`, {
    method: "PATCH",
    headers: buildHeaders(apiKey),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update invoice ${id}: ${res.status}`);
  }
  return res.json() as Promise<Invoice>;
}

export async function getInvoiceComments(
  id: number,
): Promise<InvoiceComment[]> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/invoices/${id}/comments/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch comments for invoice ${id}: ${res.status}`);
  }
  return res.json() as Promise<InvoiceComment[]>;
}

export async function commentOnInvoice(
  id: number,
  comment: string,
): Promise<InvoiceComment> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/invoices/${id}/comments/`, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) {
    throw new Error(`Failed to add comment to invoice ${id}: ${res.status}`);
  }
  return res.json() as Promise<InvoiceComment>;
}

export async function getPendingCod(): Promise<unknown> {
  const apiKey = await getYdmApiKey();
  const res = await fetch(`${BASE_URL}/api/pending-cod/`, {
    headers: buildHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch pending COD: ${res.status}`);
  }
  return res.json();
}

export type InvoiceStatus = "Pending" | "Partially Paid" | "Paid" | "Cancelled";
export type PaymentType = "Cash" | "Card" | "Bank Transfer" | string;

export interface Invoice {
  id: number;
  franchise: number;
  created_by: number;
  invoice_code: string;
  total_amount: string;
  paid_amount: string;
  due_amount: string;
  payment_type: PaymentType;
  status: InvoiceStatus | string;
  approved_at: string | null;
  is_approved: boolean;
  signature: string | null;
  created_at: string;
  updated_at: string;
  approved_by: number | null;
}

export interface PaginatedInvoiceResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invoice[];
}

export type InvoiceFilters = {
  page?: number;
  pageSize?: number;
  status?: string; // "all" | InvoiceStatus
  isApproved?: string; // "all" | "true" | "false"
  franchise?: number;
};

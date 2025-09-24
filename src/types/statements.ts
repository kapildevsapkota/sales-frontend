export interface StatementApiResponse {
  franchise_id: number;
  start_date: string;
  end_date: string;
  dashboard_pending_cod: number;
  dashboard_breakdown: {
    delivered_amount: number;
    total_order: number;
    total_amount: number;
    total_charge: number;
    approved_paid: number;
    delivered_count: number;
    cancelled_count: number;
  };
  statement: StatementRow[];
}

export interface StatementRow {
  date: string; // e.g. "2025-09-15" or "FINAL_VERIFICATION"
  delivery_count: number | string;
  cash_in: number | string;
  delivery_charge: number | string;
  payment: number | string;
  balance: number | string;
  total_order: number | string;
  total_amount: number | string;
}

export interface PaginatedStatementResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StatementApiResponse;
}

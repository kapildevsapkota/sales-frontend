export interface Report {
  id: number;
  date?: string;
  reported_by?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
    role: string;
    factory: string;
    distributor: string;
    franchise: string;
  };
  message_received_fb: number | null;
  message_received_whatsapp: number | null;
  message_received_tiktok: number | null;
  call_received: number | null;
  customer_follow_up: number | null;
  new_customer: number | null;
  daily_dollar_spending: number | null;
  customer_to_package: number | null;
  free_treatment: number | null;
  remarks: string | null;
  created_at: string;
  updated_at?: string;
  franchise_name?: string;
}

export interface ReportsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Report[];
}

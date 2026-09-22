export type TreatmentType =
  | 'package_member'
  | 'bottle_member'
  | 'home_oil'
  | 'one_time_service'
  | 'free_service';

export type PackageChoice = 'one_month' | 'two_month' | 'three_month';
export type PaymentMethod = 'cash' | 'online';

export interface ServiceByUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
}

export interface TreatmentImage {
  id: number;
  customer_treatment: number;
  day_number: number | null;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: number;
  customer_treatment: number;
  amount: string;
  payment_method: PaymentMethod;
  payment_method_display: string;
  payment_screenshot?: string | null;
  remarks?: string | null;
  created_by?: number | null;
  created_by_details?: ServiceByUser | null;
  payment_date: string;
  updated_at: string;
}

export interface CustomerTreatment {
  id: number;
  name: string;
  phone_number: string;
  address?: string | null;
  treatment_type: TreatmentType;
  treatment_type_display: string;
  package?: PackageChoice | null;
  package_display?: string | null;
  package_price?: number | null;
  total_amount?: string | null;
  calculated_total_amount: number;
  total_paid: number;
  due_amount: number;
  payment_status: 'Paid' | 'Partial' | 'Pending' | 'Free';
  payment_method?: PaymentMethod | null;
  payment_method_display?: string | null;
  reason?: string | null;
  service_by?: number | null;
  service_by_details?: ServiceByUser | null;
  payment_screenshot?: string | null;
  images: TreatmentImage[];
  payment_history: PaymentRecord[];
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerPayload {
  name: string;
  phone_number: string;
  address?: string;
  treatment_type: TreatmentType;
  package?: PackageChoice;
  reason?: string;
  total_amount?: number | string;
  paid_amount?: number | string;
  payment_method?: PaymentMethod;
  payment_screenshot?: File;
}

export interface RecordPaymentPayload {
  customer_treatment: number;
  amount: number | string;
  payment_method: PaymentMethod;
  remarks?: string;
  payment_screenshot?: File;
}

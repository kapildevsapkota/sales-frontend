export interface Organization {
  id: number;
  name: string;
  logo: string | null;
}

export interface OrganizationData {
  id: number;
  name: string;
  organization: Organization;
}

export interface GiftItem {
  id: number;
  name: string;
  image: string;
  category: string;
  lucky_draw_system: number;
}

export interface SubmissionResponse {
  customer_name: string;
  date_of_purchase: string;
  gift: GiftItem[];
  imei: string;
  phone_model: string;
  phone_number: string;
  shop_name: string;
  sold_area: string;
  email?: string;
}

export interface ErrorResponse {
  error: string;
}

export interface FormData {
  full_name: string;
  phone_number: string;
}

export interface SpriteWheelItem {
  id: number;
  name: string;
  image: string;
  category: string;
  lucky_draw_system: number;
  index: number; // Position in the sprite wheel
}

export interface SpriteWheelConfig {
  minor: SpriteWheelItem[];
  major: SpriteWheelItem[];
  grand: SpriteWheelItem[];
}

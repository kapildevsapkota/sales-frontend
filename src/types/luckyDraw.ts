// types/luckyDraw.ts
export interface LuckyDraw {
  id: number;
  name: string;
  description: string;
  redeem_condition: string;
  terms_and_conditions: string;
  how_to_participate: string;
  background_image: string;
  hero_image: string;
  main_offer_stamp_image: string;
  qr: string;
  type: string;
  start_date: string;
  end_date: string;
}

export interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LuckyDraw[];
}

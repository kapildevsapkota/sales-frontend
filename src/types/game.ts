export type GameRuleType = "product" | "keyword";

export interface GameRuleInput {
  rule_type: GameRuleType;
  product?: number | null;
  keyword?: string | null;
  min_quantity: number;
}

export interface GameConditionInput {
  description: string;
  is_active: boolean;
  rules: GameRuleInput[];
}

export interface CreateGamePayload {
  name: string;
  description: string;
  is_active: boolean;
  conditions: GameConditionInput[];
}

export interface GameRule {
  id?: number;
  rule_type: GameRuleType;
  product: number | null;
  product_name?: string | null;
  keyword: string | null;
  min_quantity: number;
}

export interface GameCondition {
  id?: number;
  name?: string;
  description: string;
  is_active: boolean;
  rules: GameRule[];
}

export interface Game {
  id?: number;
  name: string;
  description: string;
  is_active: boolean;
  conditions: GameCondition[];
  active_condition?: number | null;
  active_condition_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ActiveGame extends Game {
  id: number;
  active_condition: number | null;
  active_condition_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChooseConditionResponse {
  message: string;
  condition: GameCondition & { id: number; name: string };
}

export interface GameWinner {
  id: number;
  game: number;
  game_name: string;
  condition: number;
  condition_name: string;
  order: number;
  order_code: string;
  customer_name: string;
  sales_person?: number;
  franchise_name?: string;
  sales_person_name?: string;
  won_at: string;
  notified: boolean;
  message: string;
}

export interface WonGame {
  game_name: string;
  condition_name: string;
  message: string;
}

export interface OrderCreateResponse {
  id: number;
  order_code: string;
  full_name: string;
  phone_number: string;
  total_amount: string;
  order_status: string;
  created_at: string;
  won_game: WonGame | null;
}

export interface Statistics {
  date: string;
  total_orders: number;
  total_orders_yesterday: number;
  total_sales: number;
  total_sales_yesterday: number;
  all_time_orders: number;
  all_time_sales: number;
}

export type Timeframe = "monthly" | "weekly" | "yearly" | "daily";

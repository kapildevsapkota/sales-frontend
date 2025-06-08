export interface Statistics {
  date: string;
  total_orders: number;
  total_orders_yesterday: number;
  total_sales: number;
  total_sales_yesterday: number;
  all_time_orders: number;
  all_time_sales: number;
  cancelled_orders_count: number;
  all_time_cancelled_sales: number;
  cancelled_orders: {
    cancelled: number;
    returned_by_customer: number;
    returned_by_dash: number;
    return_pending: number;
  };
  cancelled_amount: {
    cancelled: number;
    returned_by_customer: number;
    returned_by_dash: number;
    return_pending: number;
  };
}

export type Timeframe = "monthly" | "weekly" | "yearly" | "daily";

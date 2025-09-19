interface OrderData {
  nos: number;
  amount: number;
}

interface OverallStatistics {
  "Total Orders": OrderData;
  "Total COD": OrderData;
  "Total RTV": OrderData;
  "Total Delivery Charge": OrderData;
  "Total Pending COD": OrderData;
  "Total Delivered": OrderData;
}

interface TodaysStatistics {
  "Todays Orders": number;
  "Todays Delivery": number;
  "Todays Rescheduled": number;
  "Todays Cancellation": number;
}

interface DeliveryPerformance {
  "Delivered Percentage": number;
  "Cancelled Percentage": number;
}

interface OrderStatusBreakdown {
  Pending: OrderData;
  Processing: OrderData;
  "Sent to YDM": OrderData;
  Delivered: OrderData;
  Cancelled: OrderData;
  "Returned By Customer": OrderData;
  "Return Pending": OrderData;
  "Out For Delivery": OrderData;
  Rescheduled: OrderData;
}

interface PaymentMethods {
  "Cash on Delivery": OrderData;
  Prepaid: OrderData;
  "Office Visit": OrderData;
  Indrive: OrderData;
}

interface CodBreakdown {
  "Total COD": OrderData;
  "Delivered COD": OrderData;
  "Pending COD": OrderData;
}

interface LogisticsBreakdown {
  YDM: OrderData;
  DASH: OrderData;
}

interface LogisticsPerformance {
  "YDM Delivered": OrderData;
  "YDM Cancelled": OrderData;
  "DASH Delivered": OrderData;
  "DASH Cancelled": OrderData;
}

interface TodaysOrderStatus {
  Delivered: OrderData;
  Pending: OrderData;
  Processing: OrderData;
  "Out For Delivery": OrderData;
  Rescheduled: OrderData;
  Cancelled: OrderData;
}

interface DashboardStatisticsData {
  overall_statistics: OverallStatistics;
  todays_statistics: TodaysStatistics;
  delivery_performance: DeliveryPerformance;
  order_status_breakdown: OrderStatusBreakdown;
  payment_methods: PaymentMethods;
  cod_breakdown: CodBreakdown;
  logistics_breakdown: LogisticsBreakdown;
  logistics_performance: LogisticsPerformance;
  todays_order_status: TodaysOrderStatus;
}

export interface DashboardStatisticsResponse {
  success: boolean;
  data: DashboardStatisticsData;
}

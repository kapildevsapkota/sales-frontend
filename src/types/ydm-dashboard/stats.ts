// Base interface for order count and amount data
interface OrderData {
  nos: number; // Number of orders
  amount: number; // Total amount
}

// Order Processing Stage Types
interface OrderProcessing {
  "Order Placed": OrderData;
  "Order Picked": OrderData;
  "Order Verified": OrderData;
  "Order Processing": OrderData;
}

// Order Dispatch Stage Types
interface OrderDispatched {
  "Received At Branch": OrderData;
  "Out For Delivery": OrderData;
  Rescheduled: OrderData;
}

// Order Final Status Types
interface OrderStatus {
  Delivered: OrderData;
  Cancelled: OrderData;
  "Pending RTV": OrderData; // RTV likely means "Return to Vendor"
}

// Main response data structure
interface OrderTrackingData {
  order_processing: OrderProcessing;
  order_dispatched: OrderDispatched;
  order_status: OrderStatus;
}

// Complete API response structure
interface OrderTrackingResponse {
  success: boolean;
  data: OrderTrackingData;
}

// Alternative enum-based approach for status strings
enum OrderProcessingStage {
  ORDER_PLACED = "Order Placed",
  ORDER_PICKED = "Order Picked",
  ORDER_VERIFIED = "Order Verified",
  ORDER_PROCESSING = "Order Processing",
}

enum OrderDispatchStage {
  RECEIVED_AT_BRANCH = "Received At Branch",
  OUT_FOR_DELIVERY = "Out For Delivery",
  RESCHEDULED = "Rescheduled",
}

enum OrderFinalStatus {
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled",
  PENDING_RTV = "Pending RTV",
}

// Generic helper type for creating stage mappings
type StageMapping<T extends string> = Record<T, OrderData>;

// Alternative implementation using the enums
interface OrderTrackingDataWithEnums {
  order_processing: StageMapping<OrderProcessingStage>;
  order_dispatched: StageMapping<OrderDispatchStage>;
  order_status: StageMapping<OrderFinalStatus>;
}

// Export all types
export type {
  OrderData,
  OrderProcessing,
  OrderDispatched,
  OrderStatus,
  OrderTrackingData,
  OrderTrackingResponse,
  OrderTrackingDataWithEnums,
  StageMapping,
};

export { OrderProcessingStage, OrderDispatchStage, OrderFinalStatus };

import { Product } from "./product";

export interface OrderProduct {
  id: number;
  product: Product;
  quantity: number;
  discount: number;
  get_total_price: number;
}

// {
//                 "id": 43,
//                 "product": {
//                     "id": 1,
//                     "name": "Dandruff Oil Bottle",
//                     "price": "2500.00",
//                     "description": ""
//                 },
//                 "quantity": 1,
//                 "discount": "10.00",
//                 "get_total_price": 2250.0
//             },

export enum PaymentMethod {
  CashOnDelivery = "Cash on Delivery",
  Prepaid = "Prepaid",
}

export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export interface Order {
  id: number;
  distributor: number;
  sales_person: number;
  full_name: string;
  city: string;
  delivery_address: string;
  landmark: string;
  phone_number: string;
  alternate_phone_number: string;
  delivery_charge: number;
  payment_method: PaymentMethod;
  payment_screenshot: string | null;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
  total_amount: number;
  remarks: string;
  order_products: OrderProduct[];
}

"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import { api } from "@/lib/api";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/columns";

export function OrderListClient() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const data: Order[] = await api
      .get("/sales/orders")
      .then((res) => res.data);
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (
    orderId: number,
    newStatus: OrderStatus
  ) => {
    try {
      await api.patch(`/sales/orders/${orderId}/`, { order_status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await api.delete(`/sales/orders/${orderId}/`);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  if (orders.length === 0) {
    return <div>No orders found</div>;
  }

  return (
    <>
      <DataTable
        columns={columns(handleStatusChange, handleDeleteOrder)}
        data={orders}
      />
    </>
  );
}

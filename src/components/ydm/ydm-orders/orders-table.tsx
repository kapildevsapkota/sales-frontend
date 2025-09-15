"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

import type { SaleItem } from "@/types/ydm-dashboard/ydm-orders";

import { useRouter } from "next/navigation";

interface OrdersTableProps {
  orders: SaleItem[];
  currentPage: number;
  pageSize: number;
  getStatusColor: (status: string) => string;
  formatDate: (dateString: string) => { date: string; time: string };
}

export function OrdersTable({
  orders,
  currentPage,
  pageSize,
  getStatusColor,
  formatDate,
}: OrdersTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-100">
            <TableHead className="font-semibold">S.N.</TableHead>
            <TableHead className="font-semibold">Ordered On</TableHead>
            <TableHead className="font-semibold">Customer Info</TableHead>
            <TableHead className="font-semibold">Tracking Code</TableHead>
            <TableHead className="font-semibold">Total Price (Rs.)</TableHead>
            <TableHead className="font-semibold">Current Status</TableHead>
            <TableHead className="font-semibold">Rider Info</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No orders found matching your criteria
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => (
              <TableRow
                key={order.id}
                className="border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {(currentPage - 1) * pageSize + index + 1}
                </TableCell>
                <TableCell>
                  <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded text-center min-w-[90px]">
                    <div className="font-medium">
                      {formatDate(order.created_at).date}
                    </div>
                    <div className="text-xs opacity-90">
                      {formatDate(order.created_at).time}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      {order.full_name} ({order.phone_number})
                    </div>
                    <div className="text-xs text-gray-600">
                      {order.delivery_address}, {order.city}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className="font-mono text-sm text-primary font-medium cursor-pointer hover:underline"
                    onClick={() => {
                      router.push(`/track-order/${order.order_code}`);
                    }}
                  >
                    {order.order_code || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      Collection Amount:{" "}
                      {Number.parseFloat(order.total_amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      DeliveryCharge:{" "}
                      {Number.parseFloat(
                        order.delivery_charge
                      ).toLocaleString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs font-medium hover:bg-transparent ${getStatusColor(
                      order.order_status
                    )}`}
                  >
                    {order.order_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {order.ydm_rider_name ? (
                      <div>{order.ydm_rider_name}</div>
                    ) : (
                      <div className="text-xs text-gray-600">N/A</div>
                    )}
                    {order.ydm_rider ? (
                      <a
                        href={`tel:${order.ydm_rider}`}
                        className="text-blue-600 hover:underline"
                      >
                        <div className="text-xs text-gray-600">
                          contact: {order.ydm_rider}
                        </div>
                      </a>
                    ) : (
                      <div className="text-xs text-gray-600">contact: N/A</div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

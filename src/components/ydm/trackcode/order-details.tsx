"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  RefreshCw,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OrderData } from "@/types/ydm-dashboard/tracking";
import { OrderCommentsSection } from "./order-comment";
import { useAuth } from "@/contexts/AuthContext";

interface OrderDetailsProps {
  orderData: OrderData | null;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onRefresh: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  orderData,
  isLoading,
  error,
  onRefresh,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  // Use browser's back functionality instead of hardcoded navigation
  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to home if no history
      router.push("/");
    }
  };

  const formatCurrency = (amount: string) => {
    return `NPR ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimeShort = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className=" bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-7xl mx-auto">
          <div className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || "Order not found"}</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const total_amounts =
    parseFloat(orderData.total_amount) - parseFloat(orderData.prepaid_amount);

  // Get order placement and delivery dates
  const orderPlacedDate = orderData.created_at;
  const deliveryDate =
    orderData.order_change_log?.find((log) => log.new_status === "Delivered")
      ?.changed_at ||
    (orderData.order_status === "Delivered" ? orderData.created_at : null);

  // Sort change log chronologically
  const sortedChangeLogs = orderData.order_change_log
    ? [...orderData.order_change_log].sort(
        (a, b) =>
          new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {user &&
              (user.role === "SuperAdmin" ||
                user.role === "Franchise" ||
                user.role === "Distributor") && (
                <Button variant="outline" size="sm" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
          </div>

          <Button variant="outline" onClick={onRefresh} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Main  div */}
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-700">
                Your Order Details
              </h1>
              <div className="w-16 h-1 bg-red-400 mx-auto mt-2"></div>
            </div>

            {/* Order Timeline Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Order Placed */}
              <div className="text-left">
                <div className="text-sm text-gray-500 mb-1">Order Placed:</div>
                <div className="font-semibold text-lg">
                  {formatDateShort(orderPlacedDate)}{" "}
                  {formatTimeShort(orderPlacedDate)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {orderData.delivery_address}
                </div>
              </div>

              {/* Status Icon */}
              <div className="flex justify-center items-center">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <ArrowRight className="w-5 h-5 text-green-500" />
                    <ArrowRight className="w-5 h-5 text-green-500" />
                    <ArrowRight className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {orderData.order_status}
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">
                  {deliveryDate ? "Order Delivered:" : "Expected Delivery:"}
                </div>
                <div className="font-semibold text-lg">
                  {deliveryDate
                    ? `${formatDateShort(deliveryDate)} ${formatTimeShort(
                        deliveryDate
                      )}`
                    : "Processing"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {deliveryDate
                    ? orderData.delivery_address
                    : "Will update soon"}
                </div>
              </div>
            </div>
            {/* Order Summary divs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
              {/* Order Information */}
              <div>
                <div className="pb-3">
                  <div className="text-base font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Order Information
                  </div>
                </div>
                <div className="space-y-3 text-sm ">
                  <div className="flex justify-between ">
                    <span className="text-gray-600">Order Code:</span>
                    <span className="font-medium">{orderData.order_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Franchise:</span>
                    <span className="font-medium capitalize">
                      {orderData.sales_person.franchise}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span>{formatCurrency(orderData.delivery_charge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prepaid Amount:</span>
                    <span className="font-semibold text-green-600 text-center">
                      {formatCurrency(orderData.prepaid_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-green-700">
                      NPR {total_amounts}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span>{orderData.payment_method}</span>
                  </div>
                  {orderData.tracking_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-mono text-xs">
                        {orderData.tracking_code}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="">
                <div className="pb-3">
                  <div className="text-base font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Details
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between ">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-left">
                      {orderData.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{orderData.phone_number}</span>
                  </div>
                  {orderData.alternate_phone_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alt Phone:</span>
                      <span>{orderData.alternate_phone_number}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right max-w-48">
                      {orderData.delivery_address}
                    </span>
                  </div>

                  {orderData.remarks && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remarks:</span>
                      <span className="font-medium text-right max-w-48">
                        {orderData.remarks}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              {orderData.order_products &&
                orderData.order_products.length > 0 && (
                  <div className="">
                    <div className="pb-3">
                      <div className="text-base font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order Items
                      </div>
                    </div>
                    <div className="space-y-3">
                      {orderData.order_products.map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex justify-between items-center py-2 ${
                            index !== orderData.order_products.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-gray-700 text-sm">
                                {item.product.name}
                              </span>
                              <span className="text-gray-700 text-sm">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            {/* Package Status Details */}
            {sortedChangeLogs.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-700">
                    Package Status Details
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Date/Time
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Activity
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Activity By
                        </th>

                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Comment
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedChangeLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            <div>{formatDateShort(log.changed_at)}</div>
                            <div className="text-gray-500">
                              {formatTimeShort(log.changed_at)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            {log.new_status || "Created"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800 capitalize">
                            {log.user.first_name} {log.user.last_name} <br />
                            <span className="text-xs text-gray-500">
                              {log.user.role}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-sm">
                            {log.comment || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Comments Section */}
            {orderData.order_comment && orderData.order_comment.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-700">Comment</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Date/Time
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          By
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          Comment
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.order_comment.map((comment) => (
                        <tr
                          key={comment.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm">
                            <div>{formatDateShort(comment.created_at)}</div>
                            <div className="text-gray-500">
                              {formatTimeShort(comment.created_at)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="font-medium">
                              {comment.user.first_name} {comment.user.last_name}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {comment.user.role}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {comment.comment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {user &&
              (user.role === "SuperAdmin" ||
                user.role === "Franchise" ||
                user.role === "Distributor") && (
                <div className="mb-8">
                  <OrderCommentsSection
                    orderId={orderData.id}
                    orderCode={orderData.order_code}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

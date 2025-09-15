"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderDetails } from "@/components/ydm/trackcode/order-details";
import { TrackingErrorDisplay } from "@/components/ydm/trackcode/tracking-error-display";
import { OrderTrackingAPI } from "@/lib/ydm-api";
import type { OrderData } from "@/types/ydm-dashboard/tracking";

function useOrderTracking(trackingCode: string) {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrderNotFound, setIsOrderNotFound] = useState<boolean>(false);

  const fetchOrder = async () => {
    if (!trackingCode) return;
    setIsLoading(true);
    setError(null);
    setIsOrderNotFound(false);
    try {
      const res = await OrderTrackingAPI.trackAny(trackingCode);
      if (res.success) {
        setOrderData(res.data as OrderData);
      } else {
        setOrderData(null);
        setError(res.message || res.error || "Failed to fetch order");
        setIsOrderNotFound(
          (res.error || "").toLowerCase().includes("not found")
        );
      }
    } catch (e) {
      setOrderData(null);
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingCode]);

  const clearTracking = () => {
    setOrderData(null);
    setError(null);
    setIsOrderNotFound(false);
  };

  const refreshOrder = () => {
    fetchOrder();
  };

  const hasData = !!orderData;
  const hasError = !!error;

  return {
    orderData,
    isLoading,
    error,
    hasError,
    hasData,
    isOrderNotFound,
    clearTracking,
    refreshOrder,
  } as const;
}

export default function TrackOrderWithCodePage() {
  const params = useParams();
  const router = useRouter();
  const orderCode = params?.orderCode as string;
  const decodedOrderCode = decodeURIComponent(orderCode);

  const {
    orderData,
    isLoading,
    error,
    hasError,
    hasData,
    isOrderNotFound,
    clearTracking,
    refreshOrder,
  } = useOrderTracking(decodedOrderCode);

  const handleBackToSearch = () => {
    router.push("/");
    clearTracking();
  };

  const handleRetry = () => {
    refreshOrder();
  };

  // Show error display if there's an error and no data
  if (hasError && !hasData && !isLoading) {
    return (
      <TrackingErrorDisplay
        error={error || "Unknown error occurred"}
        trackingCode={decodedOrderCode}
        isOrderNotFound={isOrderNotFound}
        onRetry={handleRetry}
        onBack={handleBackToSearch}
        isLoading={isLoading}
      />
    );
  }

  // Show order details for successful tracking or loading state
  return (
    <div className="min-h-screen">
      <OrderDetails
        orderData={orderData}
        isLoading={isLoading}
        error={error}
        onBack={handleBackToSearch}
        onRefresh={refreshOrder}
      />
    </div>
  );
}

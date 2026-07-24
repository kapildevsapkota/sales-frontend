"use client";

import { PaymentDetailsView } from "@/components/ydm-new/payments/PaymentDetailsView";
import { useParams } from "next/navigation";

export default function VendorDetailPagePaymentDetail() {
  const params = useParams<{ paymentId: string }>();
  const paymentId = params?.paymentId;

  if (!paymentId) return <div className="p-4">Invalid Payment ID</div>;

  return (
    <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
      <PaymentDetailsView paymentId={paymentId} />
    </div>
  );
}

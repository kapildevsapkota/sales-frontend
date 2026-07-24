"use client";

import { PaymentsView } from "@/components/ydm-new/payments/PaymentsView";

export default function VendorDetailPagePayments() {
  return (
    <div className="flex flex-col w-full max-w-screen-xl mx-auto p-6 md:p-8 pt-4 pb-10 gap-4">
      <PaymentsView />
    </div>
  );
}

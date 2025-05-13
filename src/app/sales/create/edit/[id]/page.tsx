"use client";

import CreateOrderForm from "@/components/forms/create-order-form";
import { useParams } from "next/navigation";

export default function EditOrderPage() {
  const params = useParams();
  const orderId = params.id as string;

  return (
    <div>
      <CreateOrderForm
        orderId={orderId}
        isEditMode={true}
        products={[]}
        oilTypes={[]}
        convincedByOptions={[]}
      />
    </div>
  );
}

"use client";

import YdmOrdersView from "@/components/ydm/ydm-orders/ydm-orders-view";
import { useAuth } from "@/contexts/AuthContext";

export default function Orders() {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto mt-8">
      <YdmOrdersView id={Number(user?.franchise_id)} />
    </div>
  );
}

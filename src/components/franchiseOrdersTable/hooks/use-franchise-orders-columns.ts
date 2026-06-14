"use client";

import { useCallback, useState } from "react";
import type { Column } from "@/types/sale";

export function useFranchiseOrdersColumns() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "index", label: "#", visible: true, width: 50 },
    { id: "timestamp", label: "Time", visible: true, width: 10 },
    { id: "full_name", label: "Full Name", visible: true, width: 150 },
    { id: "delivery_location", label: "Delivery Location", visible: true, width: 120 },
    { id: "delivery_type", label: "Delivery Type", visible: true, width: 50 },
    { id: "order_status", label: "Order Status", visible: true, width: 50 },
    { id: "product_sold", label: "Product Sold", visible: true, width: 150 },
    { id: "total_amount", label: "Total", visible: true, width: 50 },
    { id: "remaining_amount", label: "Remaining", visible: true, width: 50 },
    { id: "payment_method", label: "Payment", visible: true, width: 40 },
    { id: "convinced_by", label: "Sold by", visible: true, width: 100 },
    { id: "remarks", label: "Remarks", visible: false, width: 50 },
    { id: "delivery_charge", label: "Delivery Charge", visible: false, width: 50 },
  ]);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  const showAllColumns = useCallback(() => {
    setColumns((prev) => prev.map((col) => ({ ...col, visible: true })));
  }, []);

  const hideAllColumns = useCallback(() => {
    setColumns((prev) =>
      prev.map((col) => ({ ...col, visible: col.id === "index" }))
    );
  }, []);

  return {
    columns,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
  };
}

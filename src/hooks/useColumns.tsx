"use client";

import { useState } from "react";
import type { Column } from "@/types/sale";

export function useColumns() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "index", label: "#", visible: true, width: 50, sortable: true },
    {
      id: "timestamp",
      label: "Timestamp",
      visible: true,
      width: 120,
      sortable: true,
    },
    {
      id: "full_name",
      label: "Full Name",
      visible: true,
      width: 150,
      sortable: true,
    },
    {
      id: "delivery_location",
      label: "Delivery Location",
      visible: true,
      width: 180,
      sortable: true,
    },
    {
      id: "phone_number",
      label: "Phone number",
      visible: true,
      width: 130,
      sortable: true,
    },
    {
      id: "oil_type",
      label: "Oil Type",
      visible: true,
      width: 120,
      sortable: true,
    },
    {
      id: "quantity",
      label: "Quantity",
      visible: true,
      width: 80,
      sortable: true,
    },
    {
      id: "total_amount",
      label: "Total amount",
      visible: true,
      width: 120,
      sortable: true,
    },
    {
      id: "remaining_amount",
      label: "Remaining Amount",
      visible: true,
      width: 120,
      sortable: true,
    },
    {
      id: "payment_method",
      label: "Payment method",
      visible: true,
      width: 150,
      sortable: true,
    },
    {
      id: "send_order",
      label: "Send Order",
      visible: true,
      width: 120,
      sortable: false,
    },
    {
      id: "edit",
      label: "Edit",
      visible: true,
      width: 100,
      sortable: false,
    },
    {
      id: "remarks",
      label: "Remarks [If Any]",
      visible: false,
      width: 150,
      sortable: true,
    },
    {
      id: "convinced_by",
      label: "Convinced by",
      visible: false,
      width: 120,
      sortable: true,
    },
    {
      id: "amount_paid",
      label: "Amount Paid",
      visible: false,
      width: 120,
      sortable: true,
    },
    {
      id: "delivery_charge",
      label: "Delivery Charge",
      visible: false,
      width: 150,
      sortable: true,
    },
    {
      id: "remaining",
      label: "Remaining",
      visible: false,
      width: 120,
      sortable: true,
    },
    {
      id: "order_status",
      label: "Order Status",
      visible: false,
      width: 120,
      sortable: true,
    },
  ]);

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Show all columns
  const showAllColumns = () => {
    setColumns(columns.map((col) => ({ ...col, visible: true })));
  };

  // Hide all columns except the first one
  const hideAllColumns = () => {
    setColumns(columns.map((col) => ({ ...col, visible: col.id === "index" })));
  };

  return {
    columns,
    setColumns,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
  };
}

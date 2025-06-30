"use client";
import { Column } from "@/types/sale";
import { useState, useCallback } from "react";

export function useTableColumns() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "index", label: "#", visible: true, width: 50 },
    {
      id: "timestamp",
      label: "Time",
      visible: true,
      width: 10,
    },
    {
      id: "full_name",
      label: "Full Name",
      visible: true,
      width: 150,
    },
    {
      id: "dash_location_name",
      label: "Dash Location",
      visible: true,
      width: 350,
    },
    {
      id: "delivery_location",
      label: "Delivery Location",
      visible: true,
      width: 120,
    },

    {
      id: "phone_number",
      label: "Phone",
      visible: true,
      width: 50,
    },
    {
      id: "alternate_phone_number",
      label: "Alternate Phone",
      visible: true,
      width: 50,
    },
    {
      id: "product_sold",
      label: "Product Sold",
      visible: true,
      width: 150,
    },
    {
      id: "total_amount",
      label: "Total",
      visible: true,
      width: 50,
    },
    {
      id: "remaining_amount",
      label: "Remaining",
      visible: true,
      width: 50,
    },
    {
      id: "payment_method",
      label: "Payment",
      visible: true,
      width: 40,
    },
    {
      id: "remarks",
      label: "Remarks [If Any]",
      visible: false,
      width: 50,
    },
    {
      id: "convinced_by",
      label: "Sold by",
      visible: true,
      width: 100,
    },
    {
      id: "amount_paid",
      label: "Amount Paid",
      visible: false,
      width: 120,
    },
    {
      id: "delivery_charge",
      label: "Delivery Charge",
      visible: false,
      width: 50,
    },
    {
      id: "logistics_name",
      label: "Logistics",
      visible: true,
      width: 120,
    },
    {
      id: "delivery_type",
      label: "Delivery Type",
      visible: true,
      width: 50,
    },
    {
      id: "order_status",
      label: "Order Status",
      visible: true,
      width: 50,
    },
    {
      id: "edit",
      label: "Edit",
      visible: true,
      width: 100,
    },
  ]);

  // Toggle column visibility
  const toggleColumnVisibility = useCallback(
    (columnId: string) => {
      setColumns(
        columns.map((col) =>
          col.id === columnId ? { ...col, visible: !col.visible } : col
        )
      );
    },
    [columns]
  );

  // Show all columns
  const showAllColumns = useCallback(() => {
    setColumns(columns.map((col) => ({ ...col, visible: true })));
  }, [columns]);

  // Hide all columns except the first one
  const hideAllColumns = useCallback(() => {
    setColumns(columns.map((col) => ({ ...col, visible: col.id === "index" })));
  }, [columns]);

  return {
    columns,
    setColumns,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
  };
}

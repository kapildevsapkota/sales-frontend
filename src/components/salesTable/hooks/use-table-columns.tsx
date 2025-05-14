"use client";
import { useState, useCallback } from "react";
import type React from "react";

import type { Column } from "@/types/sale";

export function useTableColumns() {
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
      id: "product_sold",
      label: "Product Sold",
      visible: true,
      width: 200,
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
      id: "remarks",
      label: "Remarks [If Any]",
      visible: false,
      width: 150,
      sortable: true,
    },
    {
      id: "convinced_by",
      label: "Convinced by",
      visible: true,
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
      id: "order_status",
      label: "Order Status",
      visible: true,
      width: 150,
      sortable: true,
    },
    {
      id: "edit",
      label: "Edit",
      visible: true,
      width: 100,
      sortable: false,
    },
  ]);

  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

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

  // Column resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, columnId: string, initialWidth: number) => {
      setResizingColumn(columnId);
      setStartX(e.clientX);
      setStartWidth(initialWidth);
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      e.preventDefault();
    },
    []
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (resizingColumn) {
        const column = columns.find((col) => col.id === resizingColumn);
        if (column) {
          const newWidth = Math.max(50, startWidth + (e.clientX - startX));
          setColumns(
            columns.map((col) =>
              col.id === resizingColumn ? { ...col, width: newWidth } : col
            )
          );
        }
      }
    },
    [columns, resizingColumn, startWidth, startX]
  );

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  return {
    columns,
    setColumns,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
    resizingColumn,
    startX,
    startWidth,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
  };
}

"use client";

import type React from "react";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

interface ExportModalProps {
  exportDateRange: [Date | undefined, Date | undefined];
  setExportDateRange: React.Dispatch<
    React.SetStateAction<[Date | undefined, Date | undefined]>
  >;
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const url = `${process.env.NEXT_PUBLIC_API_URL}api/sales/export-csv`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for downloading files
      });

      // Create a link element to trigger the download
      const urlObject = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlObject;
      link.setAttribute("download", `sales_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onClose();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            The Processing data will only export as a csv.
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExportCSV}>Export</Button>
        </div>
      </div>
    </div>
  );
}

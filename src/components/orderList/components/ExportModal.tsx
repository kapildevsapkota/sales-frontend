"use client";

import type React from "react";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

interface ExportModalProps {
  exportDateRange: [Date | undefined, Date | undefined];
  setExportDateRange: React.Dispatch<
    React.SetStateAction<[Date | undefined, Date | undefined]>
  >;
  onClose: () => void;
}

export function ExportModal({
  exportDateRange,
  setExportDateRange,
  onClose,
}: ExportModalProps) {
  const handleExportCSV = async () => {
    try {
      if (!exportDateRange[0]) {
        alert("Please select a start date.");
        return;
      }

      const token = localStorage.getItem("accessToken");
      const startDate = exportDateRange[0].toISOString().split("T")[0];
      const endDate = exportDateRange[1]
        ? exportDateRange[1].toISOString().split("T")[0]
        : "";

      const url = `https://sales.baliyoventures.com/api/sales/export-csv/?start_date=${startDate}${
        endDate ? `&end_date=${endDate}` : ""
      }`;

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
      link.setAttribute("download", `sales_${startDate}_${endDate || ""}.csv`);
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
          <h3 className="text-lg font-medium">Export CSV</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <DatePicker
                selected={exportDateRange[0]}
                onChange={(date) =>
                  setExportDateRange([date || undefined, exportDateRange[1]])
                }
                selectsStart
                startDate={exportDateRange[0]}
                endDate={exportDateRange[1]}
                placeholderText="Start Date"
                className="w-full p-2 border rounded-md"
              />
              <DatePicker
                selected={exportDateRange[1]}
                onChange={(date) =>
                  setExportDateRange([exportDateRange[0], date || undefined])
                }
                selectsEnd
                startDate={exportDateRange[0]}
                endDate={exportDateRange[1]}
                minDate={exportDateRange[0]}
                placeholderText="End Date"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
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

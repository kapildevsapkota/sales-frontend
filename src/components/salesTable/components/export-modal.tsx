"use client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-datepicker/dist/react-datepicker.css";

interface ExportModalProps {
  exportDateRange: [Date | undefined, Date | undefined];
  setExportDateRange: (dateRange: [Date | undefined, Date | undefined]) => void;
  handleExportCSV: () => void;
  setShowExportModal: (show: boolean) => void;
}

export function ExportModal({
  handleExportCSV,
  setShowExportModal,
}: ExportModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Export CSV</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowExportModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
            <h1>The Processing data will only export as a csv.</h1>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleExportCSV}>Export</Button>
        </div>
      </div>
    </div>
  );
}

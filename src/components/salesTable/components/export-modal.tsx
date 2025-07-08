"use client";
import { Button } from "@/components/ui/button";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DateRangePicker from "@/components/ui/date-range-picker";
import { useState } from "react";

interface ExportModalProps {
  exportDateRange: [Date | undefined, Date | undefined];
  setExportDateRange: (dateRange: [Date | undefined, Date | undefined]) => void;
  handleExportCSV: () => void;
  setShowExportModal: (show: boolean) => void;
  open: boolean;
  userRole?: string;
}

export function ExportModal({
  exportDateRange,
  setExportDateRange,
  handleExportCSV,
  setShowExportModal,
  open,
  userRole,
}: ExportModalProps) {
  // Convert [Date | undefined, Date | undefined] to DateRange for DateRangePicker
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: exportDateRange[0],
    to: exportDateRange[1],
  });

  const handleDateRangeChange = (
    range: { from?: Date; to?: Date } | undefined
  ) => {
    setDateRange(range || {});
    setExportDateRange([range?.from, range?.to]);
  };

  return (
    <Dialog open={open} onOpenChange={setShowExportModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export CSV</DialogTitle>
          <DialogDescription>
            {userRole === "Franchise"
              ? "Select a date range to export Franchise sales summary as CSV."
              : "The Processing data will only export as a CSV."}
          </DialogDescription>
        </DialogHeader>
        {userRole === "Franchise" && (
          <div className="mb-4">
            <DateRangePicker
              value={
                dateRange.from || dateRange.to
                  ? { from: dateRange.from, to: dateRange.to }
                  : undefined
              }
              onChange={handleDateRangeChange}
              className="w-full"
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleExportCSV}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

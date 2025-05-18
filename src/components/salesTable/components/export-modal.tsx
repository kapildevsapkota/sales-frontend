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

interface ExportModalProps {
  exportDateRange: [Date | undefined, Date | undefined];
  setExportDateRange: (dateRange: [Date | undefined, Date | undefined]) => void;
  handleExportCSV: () => void;
  setShowExportModal: (show: boolean) => void;
  open: boolean;
}

export function ExportModal({
  handleExportCSV,
  setShowExportModal,
  open,
}: ExportModalProps) {
  return (
    <Dialog open={open} onOpenChange={setShowExportModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export CSV</DialogTitle>
          <DialogDescription>
            The Processing data will only export as a CSV.
          </DialogDescription>
        </DialogHeader>
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

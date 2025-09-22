"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type InvoiceReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceCode: string | null | undefined;
  comments: string;
  setComments: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  submitting?: boolean;
};

export default function InvoiceReportDialog({
  open,
  onOpenChange,
  invoiceCode,
  comments,
  setComments,
  onSubmit,
  submitting,
}: InvoiceReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="ml-1">
          Comment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Comment Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Provide comments for commenting invoice{" "}
            <span className="font-mono font-semibold">{invoiceCode}</span>.
          </p>
          <Textarea
            placeholder="Enter comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={!!submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!!submitting || comments.trim().length === 0}
            >
              {submitting ? "Submitting..." : "Submit Comment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

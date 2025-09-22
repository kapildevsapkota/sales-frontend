"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { Invoice } from "@/types/invoice";
import ApproveInvoiceButton from "./ApproveInvoiceButton";
import InvoiceDetailsCard from "./InvoiceDetailsCard";
import InvoiceComments from "./InvoiceComments";

type InvoiceViewDialogProps = {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalLoadingId: number | null;
  onToggleApprove: (
    invoiceId: number,
    currentStatus: boolean
  ) => void | Promise<void>;
  comments: Array<{
    id: number;
    invoice: number;
    comment: string;
    created_at?: string;
  }>;
  commentsLoading: boolean;
  onAddComment: (text: string) => Promise<void> | void;
  formatCurrency: (amount: string | number) => string;
  formatDateTime: (iso: string | null) => string;
  submittingComment?: boolean;
};

export default function InvoiceViewDialog({
  invoice,
  open,
  onOpenChange,
  approvalLoadingId,
  onToggleApprove,
  comments,
  commentsLoading,
  onAddComment,
  formatCurrency,
  formatDateTime,
  submittingComment,
}: InvoiceViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="View">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Invoice
            <ApproveInvoiceButton
              invoiceId={invoice.id}
              isApproved={invoice.is_approved}
              onToggle={onToggleApprove}
              loadingForId={approvalLoadingId}
              className="min-w-32"
            />
          </DialogTitle>
        </DialogHeader>
        <InvoiceDetailsCard invoice={invoice} formatCurrency={formatCurrency} />
        <InvoiceComments
          comments={comments}
          isLoading={commentsLoading}
          onAdd={onAddComment}
          formatDateTime={formatDateTime}
          submitting={submittingComment}
        />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type ApproveInvoiceButtonProps = {
  invoiceId: number;
  isApproved: boolean;
  onToggle: (invoiceId: number, currentStatus: boolean) => void | Promise<void>;
  loadingForId: number | null;
  className?: string;
};

export function ApproveInvoiceButton({
  invoiceId,
  isApproved,
  onToggle,
  loadingForId,
  className,
}: ApproveInvoiceButtonProps) {
  if (isApproved) return null;

  const isLoading = loadingForId === invoiceId;

  return (
    <div className="mt-6 pt-6 border-t-2 border-gray-400 flex justify-end">
      <div className="flex justify-center">
        <Button
          onClick={() => onToggle(invoiceId, isApproved)}
          disabled={isLoading}
          className={className ?? "min-w-32"}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Approve
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}

export default ApproveInvoiceButton;

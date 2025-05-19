"use client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentImageModalProps {
  selectedPaymentImage: string;
  setShowPaymentImageModal: (show: boolean) => void;
}

export function PaymentImageModal({
  selectedPaymentImage,
  setShowPaymentImageModal,
}: PaymentImageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Payment Screenshot</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowPaymentImageModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[80vh] overflow-auto">
          <img
            src={selectedPaymentImage || "/placeholder.svg"}
            alt="Payment Screenshot"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { RecordPaymentPayload, PaymentMethod, CustomerTreatment } from "@/types/treatment";
import { recordPayment } from "@/api/treatment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, DollarSign, CreditCard, Upload, ImageIcon } from "lucide-react";

interface Props {
  customer: CustomerTreatment;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentRecordForm: React.FC<Props> = ({ customer, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordPaymentPayload>({
    defaultValues: {
      customer_treatment: customer.id,
      amount: customer.due_amount > 0 ? customer.due_amount : "",
      payment_method: "cash",
      remarks: "",
    },
  });

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setPaymentScreenshot(selected);
      setScreenshotPreview(URL.createObjectURL(selected));
    }
  };

  const onSubmit = async (data: RecordPaymentPayload) => {
    if (data.payment_method === "online" && !paymentScreenshot) {
      toast.error("Payment screenshot is required for online payments.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RecordPaymentPayload = {
        ...data,
        payment_screenshot: paymentScreenshot || undefined,
      };

      await recordPayment(payload);
      toast.success("Payment recorded successfully!");
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Due Amount Highlight Box */}
      <div className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center text-sm">
        <span className="text-gray-600">Remaining Due Amount:</span>
        <span className="font-bold text-red-600">Rs. {customer.due_amount?.toLocaleString()}</span>
      </div>

      {/* Payment Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <DollarSign className="w-3.5 h-3.5 text-teal-600" /> Payment Amount (Rs.) *
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="e.g. 3000.00"
          {...register("amount", { required: "Payment amount is required" })}
        />
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Payment Method */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <CreditCard className="w-3.5 h-3.5 text-teal-600" /> Payment Method *
        </Label>
        <Select
          value={watch("payment_method")}
          onValueChange={(val: PaymentMethod) => setValue("payment_method", val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="online">Online / QR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Remarks */}
      <div className="space-y-1.5">
        <Label htmlFor="remarks" className="text-xs font-semibold text-gray-700">
          Remarks
        </Label>
        <Textarea
          id="remarks"
          placeholder="e.g. Advance 50% QR payment"
          rows={2}
          {...register("remarks")}
        />
      </div>

      {/* Screenshot / Receipt (Required for online payments, hidden for cash) */}
      {watch("payment_method") === "online" && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> Payment Screenshot / Receipt *
          </Label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer text-xs font-medium text-gray-700">
              <Upload className="w-4 h-4 text-teal-600" /> Choose Receipt File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
              />
            </label>
            {paymentScreenshot && (
              <span className="text-xs text-emerald-600 truncate max-w-[200px]">
                {paymentScreenshot.name}
              </span>
            )}
          </div>
          {screenshotPreview && (
            <div className="mt-2">
              <img
                src={screenshotPreview}
                alt="Receipt Preview"
                className="w-24 h-24 object-cover rounded-lg border shadow-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t pt-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Recording...
            </>
          ) : (
            "Submit Payment"
          )}
        </Button>
      </div>
    </form>
  );
};

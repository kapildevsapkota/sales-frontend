"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CreateCustomerPayload, TreatmentType, PackageChoice, PaymentMethod } from "@/types/treatment";
import { createCustomerTreatment, updateCustomerTreatment } from "@/api/treatment";
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
import { Loader2, User, Phone, MapPin, DollarSign, FileText, Upload, Image as ImageIcon } from "lucide-react";

interface Props {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomerTreatmentForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    initialData?.payment_screenshot || null
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCustomerPayload>({
    defaultValues: {
      name: initialData?.name || "",
      phone_number: initialData?.phone_number || "",
      address: initialData?.address || "",
      treatment_type: initialData?.treatment_type || "package_member",
      package: initialData?.package || "one_month",
      reason: initialData?.reason || "",
      total_amount: initialData?.total_amount || "",
      paid_amount: initialData?.paid_amount || "",
      payment_method: initialData?.payment_method || "cash",
    },
  });

  const treatmentType = watch("treatment_type");
  const selectedPackage = watch("package");
  const paymentMethod = watch("payment_method") || "cash";

  const packagePrices: Record<PackageChoice, string> = {
    one_month: "5000",
    two_month: "8000",
    three_month: "12000",
  };

  React.useEffect(() => {
    if (!initialData && treatmentType === "package_member" && selectedPackage) {
      if (packagePrices[selectedPackage]) {
        setValue("total_amount", packagePrices[selectedPackage]);
      }
    }
  }, [selectedPackage, treatmentType, initialData, setValue]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setPaymentScreenshot(selected);
      setScreenshotPreview(URL.createObjectURL(selected));
    }
  };

  const onSubmit = async (data: CreateCustomerPayload) => {
    if (
      treatmentType !== "free_service" &&
      paymentMethod !== "cash" &&
      !paymentScreenshot &&
      !initialData?.payment_screenshot
    ) {
      toast.error("Payment screenshot is required for online payments.");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalTotalAmount = data.total_amount;
      if (treatmentType !== "package_member" && treatmentType !== "free_service") {
        finalTotalAmount = data.paid_amount;
      }

      const payload: CreateCustomerPayload = {
        ...data,
        total_amount: finalTotalAmount,
        payment_screenshot: paymentScreenshot || undefined,
      };

      if (initialData?.id) {
        await updateCustomerTreatment(initialData.id, payload);
        toast.success("Customer treatment updated successfully!");
      } else {
        await createCustomerTreatment(payload);
        toast.success("Customer treatment created successfully!");
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to save treatment record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <User className="w-3.5 h-3.5 text-teal-600" /> Customer Name *
        </Label>
        <Input
          id="name"
          placeholder="e.g. Sita Sharma"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Phone Number & Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone_number" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <Phone className="w-3.5 h-3.5 text-teal-600" /> Phone Number *
          </Label>
          <Input
            id="phone_number"
            placeholder="e.g. 9801234567"
            {...register("phone_number", { required: "Phone number is required" })}
          />
          {errors.phone_number && <p className="text-xs text-red-500">{errors.phone_number.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <MapPin className="w-3.5 h-3.5 text-teal-600" /> Address
          </Label>
          <Input
            id="address"
            placeholder="e.g. Kathmandu, Nepal"
            {...register("address")}
          />
        </div>
      </div>

      {/* Treatment Type */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          Treatment Type *
        </Label>
        <Select
          value={treatmentType}
          onValueChange={(val: TreatmentType) => setValue("treatment_type", val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Treatment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="package_member">Package Member</SelectItem>
            <SelectItem value="bottle_member">Bottle Member</SelectItem>
            <SelectItem value="home_oil">Home Oil</SelectItem>
            <SelectItem value="one_time_service">One Time Service</SelectItem>
            <SelectItem value="free_service">Free Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditional Package select for package_member */}
      {treatmentType === "package_member" && (
        <div className="space-y-1.5 p-3.5 bg-teal-50/50 border border-teal-100 rounded-xl">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-teal-900">
            Package *
          </Label>
          <Select
            value={watch("package") || "one_month"}
            onValueChange={(val: PackageChoice) => {
              setValue("package", val);
              if (packagePrices[val]) {
                setValue("total_amount", packagePrices[val]);
              }
            }}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select Package Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one_month">1 Month - Rs. 5000</SelectItem>
              <SelectItem value="two_month">2 Month - Rs. 8000</SelectItem>
              <SelectItem value="three_month">3 Month - Rs. 12000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Conditional Reason for free_service */}
      {treatmentType === "free_service" && (
        <div className="space-y-1.5 p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl">
          <Label htmlFor="reason" className="flex items-center gap-1.5 text-xs font-semibold text-purple-900">
            <FileText className="w-3.5 h-3.5 text-purple-600" /> Reason for Free Service *
          </Label>
          <Textarea
            id="reason"
            placeholder="Specify reason for offering free service..."
            rows={2}
            className="bg-white"
            {...register("reason", { required: treatmentType === "free_service" ? "Reason is required" : false })}
          />
          {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
        </div>
      )}

      {/* Total Amount for package_member */}
      {treatmentType === "package_member" && (
        <div className="space-y-1.5">
          <Label htmlFor="total_amount" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <DollarSign className="w-3.5 h-3.5 text-teal-600" /> Total Amount (Rs.)
          </Label>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            placeholder="e.g. 6000.00"
            {...register("total_amount")}
          />
          <p className="text-[11px] text-gray-400">
            Leave empty if standard package calculation applies.
          </p>
        </div>
      )}

      {/* Paid Amount for all non-free treatment types */}
      {treatmentType !== "free_service" && (
        <div className="space-y-1.5">
          <Label htmlFor="paid_amount" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Paid Amount (Rs.)
          </Label>
          <Input
            id="paid_amount"
            type="number"
            step="0.01"
            placeholder="e.g. 1000.00"
            {...register("paid_amount")}
          />
        </div>
      )}

      {/* Payment Method (for non-free services) */}
      {treatmentType !== "free_service" && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            Payment Method *
          </Label>
          <Select
            value={watch("payment_method") || "cash"}
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
      )}

      {/* Initial Payment Screenshot Upload (Only for non-cash & non-free services) */}
      {treatmentType !== "free_service" && paymentMethod !== "cash" && (
        <div className="space-y-1.5 border-t pt-4">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
            <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
            Payment Screenshot / Receipt *
          </Label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer text-xs font-medium text-gray-700">
              <Upload className="w-4 h-4 text-teal-600" /> Choose File
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

      {/* Form Buttons */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : initialData ? (
            "Update Customer"
          ) : (
            "Create Customer Record"
          )}
        </Button>
      </div>
    </form>
  );
};

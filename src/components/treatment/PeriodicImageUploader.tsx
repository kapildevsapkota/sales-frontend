"use client";

import React, { useState } from "react";
import { uploadDayProgressImage, deleteTreatmentImage } from "@/api/treatment";
import { CustomerTreatment, TreatmentImage } from "@/types/treatment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Upload, Loader2, CheckCircle2, Image as ImageIcon, Trash2 } from "lucide-react";

// Standard 4-day progress schedule
const PERIODIC_DAYS = [1, 4, 8, 12, 16, 20, 24, 28, 32];

interface Props {
  customer: CustomerTreatment;
  onUpdate?: () => void;
}

export const PeriodicImageUploader: React.FC<Props> = ({ customer, onUpdate }) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an image file first.");
      return;
    }

    setIsUploading(true);
    try {
      await uploadDayProgressImage(customer.id, selectedDay, file);
      toast.success(`Progress photo for Day ${selectedDay} uploaded successfully!`);
      setFile(null);
      setPreviewUrl(null);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm("Are you sure you want to delete this progress photo?")) return;
    setDeletingId(imageId);
    try {
      await deleteTreatmentImage(imageId);
      toast.success("Image deleted successfully");
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  // Map uploaded images by day number
  const existingImagesByDay = customer.images.reduce<Record<number, TreatmentImage>>(
    (acc, img) => {
      if (img.day_number !== null) acc[img.day_number] = img;
      return acc;
    },
    {}
  );

  const isPeriodicType =
    customer.treatment_type === "package_member" ||
    customer.treatment_type === "bottle_member";

  if (!isPeriodicType) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 text-amber-800 text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>
            Periodic 4-day progress image uploads are only active for <strong>Package Member</strong> and <strong>Bottle Member</strong> treatment types.
          </span>
        </CardContent>
      </Card>
    );
  }

  const currentUploaded = existingImagesByDay[selectedDay];

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-600" />
          Treatment Progress Photos (Every 4 Days)
        </CardTitle>
        <CardDescription>
          Track visual progress for {customer.name} at 4-day periodic intervals (Day 1, 4, 8, 12...).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Day Selector Buttons */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Select Day Interval
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {PERIODIC_DAYS.map((day) => {
              const uploadedImg = existingImagesByDay[day];
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day);
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/20 font-bold text-teal-700 shadow-sm"
                      : uploadedImg
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70"
                      : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="text-sm">Day {day}</span>
                  {uploadedImg ? (
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 bg-emerald-200/70 text-emerald-900 rounded-full font-medium">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="inline-block mt-1 text-[10px] text-gray-400">
                      Pending
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Upload & Preview Container */}
        <div className="p-5 border border-dashed rounded-xl bg-slate-50/70 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 text-base">
              Photo Record for <span className="text-teal-600 font-bold">Day {selectedDay}</span>
            </h4>
            {currentUploaded && (
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs gap-1"
                disabled={deletingId === currentUploaded.id}
                onClick={() => handleDelete(currentUploaded.id)}
              >
                {deletingId === currentUploaded.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete Photo
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* Existing Image Display */}
            <div>
              <span className="text-xs font-medium text-gray-500 block mb-1.5">
                Current Photo for Day {selectedDay}:
              </span>
              {currentUploaded ? (
                <div className="relative group rounded-lg overflow-hidden border bg-white shadow-sm max-w-xs">
                  <img
                    src={currentUploaded.image}
                    alt={`Day ${selectedDay}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2 bg-white/95 text-[11px] text-gray-500 border-t flex justify-between items-center">
                    <span>Uploaded: {new Date(currentUploaded.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-xs h-48 rounded-lg border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                  <ImageIcon className="w-8 h-8 mb-2 stroke-1 text-gray-300" />
                  <span className="text-xs">No image uploaded for Day {selectedDay} yet</span>
                </div>
              )}
            </div>

            {/* Upload Box */}
            <div className="space-y-3">
              <span className="text-xs font-medium text-gray-500 block">
                Upload or Replace Photo:
              </span>
              <input
                type="file"
                accept="image/*"
                id="day-image-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="day-image-input"
                className="flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4 text-teal-600" />
                {file ? file.name : "Choose Photo File..."}
              </label>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 font-medium">Selected Preview:</span>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                  />
                </div>
              )}

              <Button
                type="button"
                disabled={!file || isUploading}
                onClick={handleUpload}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium gap-2 shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Save Day {selectedDay} Photo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

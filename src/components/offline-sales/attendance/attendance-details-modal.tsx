"use client";

import { OfflineAttendance } from "@/types/offline-sales";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Navigation,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface AttendanceDetailsModalProps {
  record: OfflineAttendance | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceDetailsModal({
  record,
  isOpen,
  onClose,
}: AttendanceDetailsModalProps) {
  if (!record) return null;

  const formattedTime = (() => {
    try {
      return format(new Date(record.attendance_time), "hh:mm:ss a");
    } catch {
      return record.attendance_time;
    }
  })();

  const hasCoords =
    Boolean(record.attendance_lat) &&
    Boolean(record.attendance_long) &&
    record.attendance_lat !== "0" &&
    record.attendance_long !== "0";

  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        record.attendance_lat
      )},${encodeURIComponent(record.attendance_long)}`
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                {record.sales_person_name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Staff ID #{record.sales_person} • Attendance Check-in #{record.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Check-in Selfie / Photo */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-purple-600" /> Check-in Verification Photo
            </h4>
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center shadow-inner">
              {record.image ? (
                <Image
                  src={record.image}
                  alt={`Check-in photo for ${record.sales_person_name}`}
                  fill
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                  <ImageIcon className="h-10 w-10 stroke-1" />
                  <span className="text-xs">No verification photo captured</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Attendance Date
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                {record.attendance_date}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 space-y-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Timestamp
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Location & GPS */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-purple-600" /> Logged Location
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span>{record.attendance_location || "Location not recorded"}</span>
            </div>

            {hasCoords && (
              <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-500">
                <span>Latitude: <strong className="text-slate-700 dark:text-slate-300">{record.attendance_lat}</strong></span>
                <span>Longitude: <strong className="text-slate-700 dark:text-slate-300">{record.attendance_long}</strong></span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

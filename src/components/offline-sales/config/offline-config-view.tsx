"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { OfflineAttendanceConfig } from "@/types/offline-sales";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Save,
  RefreshCw,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { isAxiosError } from "axios";

const QUICK_PRESETS = [
  { label: "09:00 AM", value: "09:00:00" },
  { label: "10:00 AM", value: "10:00:00" },
  { label: "10:30 AM", value: "10:30:00" },
  { label: "11:00 AM", value: "11:00:00" },
  { label: "12:00 PM", value: "12:00:00" },
  { label: "01:00 PM", value: "13:00:00" },
];

export function OfflineConfigView() {
  const [config, setConfig] = useState<OfflineAttendanceConfig | null>(null);
  const [cutoffTime, setCutoffTime] = useState<string>("12:00:00");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      try {
        response = await api.get<OfflineAttendanceConfig>(
          "/api/offline-sales/attendance/config/"
        );
      } catch (err: unknown) {
        if (
          isAxiosError(err) &&
          (err.response?.status === 404 || err.response?.status === 301)
        ) {
          response = await api.get<OfflineAttendanceConfig>(
            "/api/offline-sales/attendance/config"
          );
        } else {
          throw err;
        }
      }

      setConfig(response.data);
      if (response.data.cutoff_time) {
        setCutoffTime(response.data.cutoff_time);
      }
    } catch (err: unknown) {
      console.error("Failed to load attendance config:", err);
      let msg = "Failed to load attendance configuration.";
      if (isAxiosError<{ detail?: string }>(err)) {
        msg = err.response?.data?.detail || msg;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleUpdate = async () => {
    if (!cutoffTime || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(cutoffTime.trim())) {
      toast.error("Please enter a valid time in HH:MM:SS or HH:MM format.");
      return;
    }

    let formatted = cutoffTime.trim();
    // Normalize single digit hour e.g. "9:00" -> "09:00:00"
    const parts = formatted.split(":");
    if (parts[0].length === 1) {
      parts[0] = "0" + parts[0];
    }
    if (parts.length === 2) {
      parts.push("00");
    }
    formatted = parts.join(":");

    try {
      setIsUpdating(true);

      let response;
      try {
        response = await api.patch<OfflineAttendanceConfig>(
          "/api/offline-sales/attendance/config/",
          { cutoff_time: formatted }
        );
      } catch (err: unknown) {
        if (
          isAxiosError(err) &&
          (err.response?.status === 404 || err.response?.status === 301)
        ) {
          response = await api.patch<OfflineAttendanceConfig>(
            "/api/offline-sales/attendance/config",
            { cutoff_time: formatted }
          );
        } else {
          throw err;
        }
      }

      setConfig(response.data);
      setCutoffTime(response.data.cutoff_time);
      toast.success("Attendance cutoff time updated successfully!");
    } catch (err: unknown) {
      console.error("Failed to update cutoff time:", err);
      let msg = "Failed to update cutoff time.";
      if (isAxiosError<{ detail?: string; message?: string }>(err)) {
        msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          (err.response?.status === 403
            ? "Permission Denied: Only SuperAdmin can modify cutoff time."
            : msg);
      }
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const format12Hour = (timeStr?: string) => {
    if (!timeStr) return "—";
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const hasChanged =
    Boolean(config) &&
    cutoffTime.trim() !== config?.cutoff_time?.trim() &&
    cutoffTime.trim() + ":00" !== config?.cutoff_time?.trim();

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-6">
      <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-neutral-900">
        <CardHeader className="text-center pb-4 border-b border-slate-100 dark:border-neutral-800">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 mb-2">
            <Clock className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance Cutoff Time
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Salespersons must post attendance before this time.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-rose-800 dark:text-rose-200 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={fetchConfig}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Current Active Cutoff Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-purple-950/30 dark:to-neutral-900 border border-purple-100 dark:border-purple-900/40 text-center space-y-1">
            <p className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              Current Active Cutoff Time
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {isLoading ? "—" : config?.cutoff_time || "—"}
              </span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                ({format12Hour(config?.cutoff_time)})
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Daily deadline for field salesperson check-ins
            </p>
          </div>

          {/* Cutoff Time Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Edit Cutoff Time (HH:MM:SS)
              </Label>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {format12Hour(cutoffTime)}
              </span>
            </div>

            <div className="relative">
              <Input
                type="text"
                disabled={isUpdating || isLoading}
                placeholder="10:30:00"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="font-mono text-center text-lg font-bold tracking-wider h-12 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 focus-visible:ring-purple-600"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-slate-400 text-center">
                Quick Presets
              </p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUpdating || isLoading}
                    onClick={() => setCutoffTime(preset.value)}
                    className={`text-xs rounded-xl h-8 transition-all ${
                      cutoffTime === preset.value
                        ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:text-white"
                        : "hover:bg-purple-50 hover:text-purple-700"
                    }`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Update Action Button */}
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || isLoading || !hasChanged}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 text-sm font-semibold gap-2 shadow-sm"
          >
            {isUpdating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : hasChanged ? (
              <Save className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            )}
            <span>{hasChanged ? "Update Cutoff Time" : "Cutoff Time Saved"}</span>
          </Button>

          {/* Metadata Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Updated by:{" "}
                <strong className="text-slate-600 dark:text-slate-300">
                  {config?.updated_by_name || "—"}
                </strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {config?.updated_at
                  ? format(new Date(config.updated_at), "MMM dd, yyyy • hh:mm a")
                  : "—"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={fetchConfig}
              disabled={isLoading}
              className="h-7 px-2 text-[11px] text-slate-500 hover:text-purple-600 gap-1 rounded-lg"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

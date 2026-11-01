"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { SalesPersonTracking } from "@/types/offline-sales";
import { useDebounce } from "@/hooks/use-debounce";
import { SalespersonTrackingMap } from "./salesperson-tracking-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  RefreshCw,
  MapPin,
  Users,
  Phone,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export function SalespersonTrackingView() {
  const [salespersons, setSalespersons] = useState<SalesPersonTracking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSalesperson, setSelectedSalesperson] = useState<SalesPersonTracking | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30s default
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Fetch salespersons tracking
  const fetchTracking = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      setError(null);

      // Call /api/tracking/salespersons/
      let response;
      try {
        response = await api.get<SalesPersonTracking[] | { results?: SalesPersonTracking[] }>(
          "/api/tracking/salespersons/"
        );
      } catch (err: unknown) {
        if (
          isAxiosError(err) &&
          (err.response?.status === 404 || err.response?.status === 301)
        ) {
          response = await api.get<SalesPersonTracking[] | { results?: SalesPersonTracking[] }>(
            "/api/tracking/salespersons"
          );
        } else {
          throw err;
        }
      }

      const data = response.data;
      const results: SalesPersonTracking[] = Array.isArray(data)
        ? data
        : data?.results || [];

      setSalespersons(results);
      setLastRefreshedAt(new Date());

      // Update selected salesperson with fresh data if already selected
      setSelectedSalesperson((prev) => {
        if (!prev) return results[0] || null;
        const updated = results.find((s) => s.id === prev.id);
        return updated || prev;
      });
    } catch (err: unknown) {
      console.error("Failed to load salesperson locations:", err);
      let errorMsg = "Failed to load salespersons locations.";
      if (isAxiosError<{ detail?: string; message?: string }>(err)) {
        errorMsg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      if (!isSilent) toast.error("Failed to fetch tracking data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTracking(false);
  }, [fetchTracking]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchTracking(true);
    }, autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchTracking]);

  // Filtered salespersons list
  const filteredSalespersons = useMemo(() => {
    return salespersons.filter((sp) => {
      const isOnline =
        sp.is_online || sp.is_active_now || sp.tracking_status?.toUpperCase() === "ONLINE";

      // Status filter
      if (statusFilter === "online" && !isOnline) return false;
      if (statusFilter === "offline" && isOnline) return false;

      // Search filter
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const nameMatch = sp.full_name?.toLowerCase().includes(query);
        const userMatch = sp.username?.toLowerCase().includes(query);
        const phoneMatch = sp.phone_number?.includes(query);
        return nameMatch || userMatch || phoneMatch;
      }

      return true;
    });
  }, [salespersons, statusFilter, debouncedSearch]);

  const formatRelativePing = (seconds?: number | null, isoDate?: string) => {
    if (seconds != null && seconds >= 0) {
      if (seconds < 60) return `${seconds}s ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    }
    if (isoDate) {
      const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    }
    return "Recently";
  };

  return (
    <div className="space-y-6">
      {/* Main Tracking Workspace */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-5 space-y-5">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by salesperson name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 h-10 rounded-xl text-xs sm:text-sm"
            />
          </div>

          {/* Action Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val: "all" | "online" | "offline") => setStatusFilter(val)}
            >
              <SelectTrigger className="w-[130px] h-10 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-xs sm:text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="online">Online Only</SelectItem>
                <SelectItem value="offline">Offline Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Auto Refresh Select */}
            <Select
              value={String(autoRefreshInterval)}
              onValueChange={(val) => setAutoRefreshInterval(Number(val))}
            >
              <SelectTrigger className="w-[125px] h-10 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-xs sm:text-sm">
                <SelectValue placeholder="Auto Sync" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Sync: 15s</SelectItem>
                <SelectItem value="30">Sync: 30s</SelectItem>
                <SelectItem value="60">Sync: 60s</SelectItem>
                <SelectItem value="0">Manual Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Manual Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchTracking(false)}
              disabled={isLoading}
              className="h-10 w-10 rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
              title="Refresh Locations"
            >
              <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            {lastRefreshedAt && (
              <span className="text-[11px] text-slate-400 hidden md:inline ml-1">
                Synced {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-300 text-rose-700 hover:bg-rose-100"
              onClick={() => fetchTracking(false)}
            >
              Retry
            </Button>
          </div>
        )}

        {/* 2-Column Split: Agents List + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Agents List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
              <span>Sales Agents ({filteredSalespersons.length})</span>
              <span>Click to view on map</span>
            </div>

            <div className="space-y-2.5 max-h-[540px] sm:max-h-[620px] overflow-y-auto pr-1">
              {filteredSalespersons.length === 0 ? (
                <div className="py-12 text-center p-4 border border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl">
                  <Users className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No salespersons found
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try adjusting search query or filters.
                  </p>
                </div>
              ) : (
                filteredSalespersons.map((sp) => {
                  const isOnline =
                    sp.is_online || sp.is_active_now || sp.tracking_status?.toUpperCase() === "ONLINE";
                  const isSelected = selectedSalesperson?.id === sp.id;
                  const hasLocation =
                    sp.latitude != null &&
                    sp.longitude != null &&
                    !isNaN(sp.latitude) &&
                    !isNaN(sp.longitude);

                  return (
                    <div
                      key={sp.id}
                      onClick={() => setSelectedSalesperson(sp)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-50 dark:bg-neutral-800 border-slate-400 dark:border-neutral-600 shadow-sm ring-1 ring-slate-300 dark:ring-neutral-700"
                          : "bg-white dark:bg-neutral-900 hover:bg-slate-50/70 dark:hover:bg-neutral-800/50 border-slate-200 dark:border-neutral-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar Circle */}
                          <div className="relative shrink-0">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border ${
                                isSelected
                                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-white"
                                  : "bg-slate-100 text-slate-800 dark:bg-neutral-800 dark:text-slate-200 border-slate-200 dark:border-neutral-700"
                              }`}
                            >
                              {sp.full_name
                                ? sp.full_name.slice(0, 2).toUpperCase()
                                : "SP"}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 ${
                                isOnline ? "bg-emerald-600" : "bg-slate-400"
                              }`}
                            />
                          </div>

                          {/* Agent Info */}
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {sp.full_name || sp.username}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>{formatRelativePing(sp.seconds_since_last_ping, sp.last_updated_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <Badge
                            className={
                              isOnline
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] px-1.5 py-0 h-4 font-semibold"
                                : "bg-slate-100 text-slate-600 border-slate-200 text-[10px] px-1.5 py-0 h-4 font-semibold"
                            }
                          >
                            {isOnline ? "Online" : "Offline"}
                          </Badge>

                          {hasLocation ? (
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-0.5 font-medium">
                              <MapPin className="h-2.5 w-2.5" />
                              <span>GPS Active</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              No GPS Signal
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom row quick actions */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-slate-500">
                        {sp.phone_number ? (
                          <a
                            href={`tel:${sp.phone_number}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium"
                          >
                            <Phone className="h-2.5 w-2.5" />
                            <span>{sp.phone_number}</span>
                          </a>
                        ) : (
                          <span>—</span>
                        )}

                        {hasLocation && sp.accuracy != null && (
                          <span className="text-slate-500">
                            Accuracy &plusmn;{sp.accuracy}m
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Interactive Map (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-2">
            <SalespersonTrackingMap
              salespersons={filteredSalespersons}
              selectedSalesperson={selectedSalesperson}
              onSelectSalesperson={(sp) => setSelectedSalesperson(sp)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

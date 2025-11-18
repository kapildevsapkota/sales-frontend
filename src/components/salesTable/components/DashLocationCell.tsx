"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon, SendIcon } from "lucide-react";
import type { SaleItem, DashLocation } from "@/types/sale";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DashLocationCellProps {
  sale: SaleItem;
  onLocationUpdate?: (
    saleId: number,
    location: { id: number; name: string }
  ) => void;
  fallbackLogistics?: string;
}

export function DashLocationCell({
  sale,
  onLocationUpdate,
  fallbackLogistics,
}: DashLocationCellProps) {
  const [searchQuery, setSearchQuery] = useState(sale.location_name || "");
  const [locations, setLocations] = useState<DashLocation[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const resolveLogisticsLabel = useCallback((value?: string | null) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (
      trimmed.length === 0 ||
      trimmed.toLowerCase() === "all" ||
      trimmed.toLowerCase() === "none"
    ) {
      return undefined;
    }
    return trimmed;
  }, []);

  const logisticsSource = useMemo(() => {
    return (
      resolveLogisticsLabel(sale.logistics) ||
      resolveLogisticsLabel(sale.logistics_name) ||
      resolveLogisticsLabel(fallbackLogistics)
    );
  }, [
    resolveLogisticsLabel,
    sale.logistics,
    sale.logistics_name,
    fallbackLogistics,
  ]);

  const logisticsQueryParam = useMemo<"DASH" | "PicknDrop" | undefined>(() => {
    if (!logisticsSource) return undefined;
    const normalized = logisticsSource.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (normalized.includes("dash")) {
      return "DASH";
    }
    if (normalized.includes("pick")) {
      return "PicknDrop";
    }
    return undefined;
  }, [logisticsSource]);

  const logisticsLabel =
    logisticsQueryParam === "PicknDrop" ? "Pick & Drop" : logisticsQueryParam;
  const isSearchEnabled = Boolean(logisticsQueryParam);

  useEffect(() => {
    const locationName = sale.location_name || "";
    if (searchQuery !== locationName) {
      setSearchQuery(locationName);
    }
  }, [sale.location_name]);

  const fetchLocations = useCallback(
    async (query: string) => {
      if (!logisticsQueryParam) return;
      if (query.length < 2) {
        setLocations([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await api.get(
          `/api/sales/locations?search=${encodeURIComponent(
            query
          )}&logistics=${encodeURIComponent(logisticsQueryParam)}`
        );
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [logisticsQueryParam]
  );

  useEffect(() => {
    if (!isSearchEnabled) {
      setLocations([]);
      setIsDropdownOpen(false);
      return;
    }
    if (searchQuery.length < 2) {
      setLocations([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchLocations(searchQuery);
      } else {
        setLocations([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchLocations, isSearchEnabled]);

  const handleLocationSelect = async (location: DashLocation) => {
    setIsUpdatingLocation(true);
    try {
      await api.patch(`/api/sales/orders/${sale.id}/`, {
        location: location.id,
      });
      setSearchQuery(location.name);
      setIsDropdownOpen(false);
      if (onLocationUpdate) {
        onLocationUpdate(sale.id, { id: location.id, name: location.name });
      }
      toast.success(
        `Location for order #${sale.id} updated to ${location.name}.`
      );
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location.");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleSendOrder = async () => {
    if (!logisticsQueryParam) {
      toast.error("Select DASH or Pick & Drop logistics before sending.");
      return;
    }
    const endpoint =
      logisticsQueryParam === "PicknDrop"
        ? `/api/send-pickndrop/${sale.id}/`
        : `/api/dash/send-order/${sale.id}/`;

    setIsSendingOrder(true);
    try {
      await api.post(endpoint);
      toast.success(
        `Order #${sale.id} sent to ${logisticsLabel ?? "selected logistics"}.`
      );
    } catch (error) {
      console.error("Error sending order to logistics:", error);
      toast.error("Failed to send order.");
    } finally {
      setIsSendingOrder(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-grow" ref={containerRef}>
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
          size={16}
        />
        <Input
          placeholder={
            isSearchEnabled
              ? `Search ${logisticsLabel ?? ""} location...`
              : "Select DASH/Pick & Drop to enable search"
          }
          className={`pl-10 ${
            !isSearchEnabled ? "cursor-not-allowed opacity-70" : ""
          }`}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length >= 2) {
              setIsDropdownOpen(true);
            } else {
              setIsDropdownOpen(false);
            }
          }}
          onFocus={() => {
            if (searchQuery.length >= 2 && locations.length > 0) {
              setIsDropdownOpen(true);
            }
          }}
          disabled={isUpdatingLocation || isSendingOrder || !isSearchEnabled}
        />
        {isDropdownOpen && (
          <div className="absolute w-full top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading || isUpdatingLocation ? (
              <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-gray-400"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Loading...
              </div>
            ) : locations.length > 0 ? (
              locations.map((location) => (
                <div
                  key={location.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b ${
                    isUpdatingLocation ? "opacity-50 pointer-events-none" : ""
                  }`}
                  onClick={() =>
                    !isUpdatingLocation && handleLocationSelect(location)
                  }
                >
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-gray-500">
                    {location.coverage_areas.join(", ")}
                  </div>
                </div>
              ))
            ) : (
              searchQuery.length >= 2 && (
                <div className="p-3 text-sm text-gray-500">
                  No locations found.
                </div>
              )
            )}
          </div>
        )}
      </div>
      <Button
        onClick={handleSendOrder}
        disabled={
          !sale.location_name ||
          isSendingOrder ||
          isUpdatingLocation ||
          !isSearchEnabled
        }
      >
        {isSendingOrder ? (
          <svg
            className="animate-spin h-4 w-4 mr-2 text-white"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        ) : (
          <SendIcon size={12} />
        )}
      </Button>
    </div>
  );
}

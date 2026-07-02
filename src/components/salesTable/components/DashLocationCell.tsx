"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { AxiosError } from "axios";
import { Input } from "@/components/ui/input";
import { SearchIcon, SendIcon } from "lucide-react";
import type { SaleItem, DashLocation, DarazLocation } from "@/types/sale";
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
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    sale.location_id ?? null
  );
  const [dashLocations, setDashLocations] = useState<DashLocation[]>([]);
  const [darazLocations, setDarazLocations] = useState<DarazLocation[]>([]);
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

  const logisticsQueryParam = useMemo<
    "DASH" | "PicknDrop" | "Daraz" | undefined
  >(() => {
    if (!logisticsSource) return undefined;
    const normalized = logisticsSource.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (normalized.includes("daraz")) {
      return "Daraz";
    }
    if (normalized.includes("dash")) {
      return "DASH";
    }
    if (normalized.includes("pick")) {
      return "PicknDrop";
    }
    return undefined;
  }, [logisticsSource]);

  const logisticsLabel =
    logisticsQueryParam === "PicknDrop"
      ? "Pick & Drop"
      : logisticsQueryParam;
  const isSearchEnabled = Boolean(logisticsQueryParam);
  const showSendButton = Boolean(logisticsQueryParam);
  const hasLocationResults =
    logisticsQueryParam === "Daraz"
      ? darazLocations.length > 0
      : dashLocations.length > 0;

  useEffect(() => {
    const locationName = sale.location_name || "";
    if (searchQuery !== locationName) {
      setSearchQuery(locationName);
    }
    setSelectedLocationId(sale.location_id ?? null);
  }, [sale.location_name, sale.location_id]);

  const fetchLocations = useCallback(
    async (query: string) => {
      if (!logisticsQueryParam) return;
      if (query.length < 2) {
        setDashLocations([]);
        setDarazLocations([]);
        return;
      }
      setIsLoading(true);
      try {
        if (logisticsQueryParam === "Daraz") {
          const response = await api.get<DarazLocation[]>(
            `/api/daraz/locations/?search=${encodeURIComponent(query)}`
          );
          setDarazLocations(response.data);
          setDashLocations([]);
        } else {
          const response = await api.get<DashLocation[]>(
            `/api/sales/locations?search=${encodeURIComponent(
              query
            )}&logistics=${encodeURIComponent(logisticsQueryParam)}`
          );
          setDashLocations(response.data);
          setDarazLocations([]);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setDashLocations([]);
        setDarazLocations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [logisticsQueryParam]
  );

  useEffect(() => {
    if (!isSearchEnabled) {
      setDashLocations([]);
      setDarazLocations([]);
      setIsDropdownOpen(false);
      return;
    }
    if (searchQuery.length < 2) {
      setDashLocations([]);
      setDarazLocations([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchLocations(searchQuery);
      } else {
        setDashLocations([]);
        setDarazLocations([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchLocations, isSearchEnabled]);

  const handleLocationSelect = async (locationId: number, displayName: string) => {
    setIsUpdatingLocation(true);
    try {
      const locationPayloadKey =
        logisticsQueryParam === "Daraz" ? "daraz_location" : "location";
      await api.patch(`/api/sales/orders/${sale.id}/`, {
        [locationPayloadKey]: locationId,
      });
      setSearchQuery(displayName);
      setSelectedLocationId(locationId);
      setIsDropdownOpen(false);
      if (onLocationUpdate) {
        onLocationUpdate(sale.id, { id: locationId, name: displayName });
      }
      toast.success(
        `Location for order #${sale.id} updated to ${displayName}.`
      );
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location.");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleDashLocationSelect = (location: DashLocation) => {
    void handleLocationSelect(location.id, location.name);
  };

  const handleDarazLocationSelect = (location: DarazLocation) => {
    const displayName = `${location.area}, ${location.city}`;
    void handleLocationSelect(location.id, displayName);
  };

  const handleSendOrder = async () => {
    if (!logisticsQueryParam) {
      toast.error("Select logistics before sending.");
      return;
    }

    if (logisticsQueryParam === "Daraz" && !selectedLocationId) {
      toast.error("Select a Daraz location before sending.");
      return;
    }

    setIsSendingOrder(true);
    try {
      if (logisticsQueryParam === "Daraz") {
        await api.post(`/api/daraz/orders/${sale.id}/send/`, {
          location: selectedLocationId,
        });
      } else {
        const endpoint =
          logisticsQueryParam === "PicknDrop"
            ? `/api/send-pickndrop/${sale.id}/`
            : `/api/dash/send-order/${sale.id}/`;
        await api.post(endpoint);
      }
      toast.success(
        `Order #${sale.id} sent to ${logisticsLabel ?? "selected logistics"}.`
      );
    } catch (error) {
      console.error("Error sending order to logistics:", error);
      let errorMessage: string | undefined;
      if (typeof error === "object" && error !== null) {
        const axiosError = error as AxiosError<{
          error?: string;
          message?: string;
          detail?: string;
        }>;
        errorMessage =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          axiosError.response?.data?.detail;
      }
      toast.error(errorMessage ?? "Failed to send order.");
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
              : "Select DASH, Pick & Drop, or Daraz to search"
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
            if (searchQuery.length >= 2 && hasLocationResults) {
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
            ) : logisticsQueryParam === "Daraz" ? (
              darazLocations.length > 0 ? (
                darazLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b ${
                      isUpdatingLocation
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                    onClick={() =>
                      !isUpdatingLocation && handleDarazLocationSelect(location)
                    }
                  >
                    <div className="font-medium">{location.area}</div>
                    <div className="text-sm text-gray-500">{location.city}</div>
                  </div>
                ))
              ) : (
                searchQuery.length >= 2 && (
                  <div className="p-3 text-sm text-gray-500">
                    No locations found.
                  </div>
                )
              )
            ) : dashLocations.length > 0 ? (
              dashLocations.map((location) => (
                <div
                  key={location.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b ${
                    isUpdatingLocation ? "opacity-50 pointer-events-none" : ""
                  }`}
                  onClick={() =>
                    !isUpdatingLocation && handleDashLocationSelect(location)
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
      {showSendButton && (
        <Button
          onClick={handleSendOrder}
          disabled={
            isSendingOrder ||
            isUpdatingLocation ||
            !isSearchEnabled ||
            (logisticsQueryParam === "Daraz"
              ? !selectedLocationId
              : !sale.location_name)
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
      )}
    </div>
  );
}

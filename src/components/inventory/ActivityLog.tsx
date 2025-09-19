"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { InventoryLog } from "@/types/inventoryTypes";

interface ActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActivityLog = ({ isOpen, onClose }: ActivityLogProps) => {
  const [activityLogs, setActivityLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateInventory, setDateInventory] = useState<
    {
      inventory_id: number;
      product_id: number;
      product_name: string;
      quantity: number;
    }[]
  >([]);
  const [isDateInventoryLoading, setIsDateInventoryLoading] = useState(false);
  const [dateInventoryError, setDateInventoryError] = useState<string | null>(
    null
  );

  const fetchActivityLogs = async (url: string): Promise<void> => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    try {
      let accessToken = "";
      if (typeof window !== "undefined") {
        accessToken = localStorage.getItem("accessToken") || "";
        if (!accessToken) {
          throw new Error("Authentication token not found");
        }
      }

      // Add date filter to URL if selected
      let apiUrl = url;
      if (selectedDate) {
        const separator = url.includes("?") ? "&" : "?";
        apiUrl = `${url}${separator}changed_at=${selectedDate}`;
      }

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch activity logs: ${response.status}`);
      }
      const data = await response.json();
      setActivityLogs(data.results as InventoryLog[]);
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching activity logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivityLogs(
        "https://sales.baliyoventures.com/api/sales/user-inventory-logs/"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fetch data when date filter changes
  useEffect(() => {
    if (isOpen) {
      fetchActivityLogs(
        "https://sales.baliyoventures.com/api/sales/user-inventory-logs/"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Fetch inventory-by-date snapshot when a date is selected
  useEffect(() => {
    const fetchInventoryByDate = async (date: string) => {
      if (!date) {
        setDateInventory([]);
        setDateInventoryError(null);
        return;
      }
      setIsDateInventoryLoading(true);
      setDateInventoryError(null);
      try {
        let accessToken = "";
        if (typeof window !== "undefined") {
          accessToken = localStorage.getItem("accessToken") || "";
          if (!accessToken) {
            throw new Error("Authentication token not found");
          }
        }

        const url = `https://sales.baliyoventures.com/api/sales/inventory-date-product/?date=${encodeURIComponent(
          date
        )}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        if (!response.ok) {
          throw new Error(
            `Failed to fetch inventory snapshot: ${response.status}`
          );
        }

        const data = await response.json();
        setDateInventory(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        setDateInventoryError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching inventory by date:", err);
      } finally {
        setIsDateInventoryLoading(false);
      }
    };

    if (isOpen) {
      fetchInventoryByDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case "add":
        return "text-green-600";
      case "update":
        return "text-blue-600";
      case "delete":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleAuthError = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
  };

  const fetchNextPage = () => {
    if (nextPage) {
      fetchActivityLogs(nextPage);
    }
  };

  const fetchPreviousPage = () => {
    if (previousPage) {
      fetchActivityLogs(previousPage);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Activity Log</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Date Filter */}
        <div className="mb-4">
          <label
            htmlFor="dateFilter"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by Date
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              id="dateFilter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                setSelectedDate("");
                setDateInventory([]);
                setDateInventoryError(null);
              }}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Clear
            </button>
          </div>
        </div>

        <button
          onClick={() =>
            fetchActivityLogs(
              "https://sales.baliyoventures.com/api/sales/user-inventory-logs/"
            )
          }
          className="mb-4 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
        >
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>

        {/* Inventory Snapshot for Selected Date */}
        {selectedDate && (
          <div className="mb-4 border rounded-md p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Inventory on {selectedDate}</h3>
              {isDateInventoryLoading && (
                <span className="text-xs text-gray-500">Loading…</span>
              )}
            </div>
            {dateInventoryError ? (
              <div className="text-sm text-red-600">{dateInventoryError}</div>
            ) : dateInventory.length === 0 && !isDateInventoryLoading ? (
              <p className="text-sm text-gray-600">No data for this date.</p>
            ) : (
              <div className="max-h-56 overflow-y-auto divide-y">
                {dateInventory.map((item) => (
                  <div
                    key={item.inventory_id}
                    className="py-2 flex justify-between"
                  >
                    <span className="text-sm">{item.product_name}</span>
                    <span className="text-sm font-medium">{item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            <p>Error loading activity logs: {error}</p>
            {error.includes("Authentication") ? (
              <button
                onClick={handleAuthError}
                className="mt-2 text-sm underline"
              >
                Go to login
              </button>
            ) : (
              <button
                onClick={() =>
                  fetchActivityLogs(
                    "https://sales.baliyoventures.com/api/sales/user-inventory-logs/"
                  )
                }
                className="mt-2 text-sm underline"
              >
                Try again
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activityLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No activity logs found
              </p>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="border-b pb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{log.product_name}</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(log.changed_at)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={cn(
                        "font-medium capitalize",
                        getActionColor(log.action)
                      )}
                    >
                      {log.action}
                    </span>
                    <span className="text-gray-600">
                      {log.action === "add" ? (
                        <> added {log.new_quantity} units</>
                      ) : log.action === "update" ? (
                        <>
                          {" "}
                          changed from {log.old_quantity} to {log.new_quantity}{" "}
                          units
                        </>
                      ) : (
                        <> removed {log.old_quantity} units</>
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <p>By: {log.user_name}</p>
                    <p>{log.organization}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        <div className="flex justify-between mt-4">
          <button
            onClick={fetchPreviousPage}
            disabled={!previousPage}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={fetchNextPage}
            disabled={!nextPage}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;

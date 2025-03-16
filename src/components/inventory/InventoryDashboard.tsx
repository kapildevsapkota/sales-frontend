"use client";

import { useState, useEffect, JSX } from "react";
import { cn } from "@/lib/utils";
import { Factory, TruckIcon, X } from "lucide-react";
import { MdStorefront } from "react-icons/md";
import FactoryDashboard from "@/components/inventory/factory/FactoryDashboard";
import ProductInventory from "@/components/inventory/distributor/ProductInventory";
import StockManagement from "@/components/inventory/franchise/StockManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/contexts/AuthContext";
import { InventoryLog } from "@/types/inventoryTypes";

interface Tab {
  id: string;
  label: string;
  icon: JSX.Element;
  isRightAligned?: boolean;
}

const InventoryDashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const [activeTab, setActiveTab] = useState("factory");
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);

  const tabs: Tab[] = [
    {
      id: "factory",
      label: "Factory Inventory",
      icon: <Factory className="h-4 w-4 mr-2" />,
    },
    {
      id: "distributors",
      label: "My Distributors",
      icon: <TruckIcon className="h-4 w-4 mr-2" />,
    },
    {
      id: "franchise",
      label: "Franchise",
      icon: <MdStorefront className="h-4 w-4 mr-2" />,
    },
    {
      id: "supply",
      label: "Supply Chain",
      icon: <TruckIcon className="h-4 w-4 mr-2" rotate={180} />,
    },
    {
      id: "activity-log",
      label: "Activity Log",
      icon: <MdStorefront className="h-4 w-4 mr-2" />,
      isRightAligned: true,
    },
  ].filter((tab) => {
    if (userRole === Role.SuperAdmin) return true;
    if (userRole === Role.Distributor) {
      return (
        tab.id === "distributors" ||
        tab.id === "franchise" ||
        tab.id === "supply" ||
        tab.id === "activity-log"
      );
    }
    if (userRole === Role.Franchise) {
      return (
        tab.id === "franchise" ||
        tab.id === "supply" ||
        tab.id === "activity-log"
      );
    }
    if (userRole === Role.Factory) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (userRole === Role.SuperAdmin) {
      setActiveTab("factory");
    } else if (userRole === Role.Distributor) {
      setActiveTab("distributors");
    } else if (userRole === Role.Franchise) {
      setActiveTab("franchise");
    } else if (userRole === Role.Factory) {
      setActiveTab("factory");
    }
  }, [userRole]);

  const fetchActivityLogs = async (url: string): Promise<void> => {
    if (!isActivityLogOpen) return;

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
    if (isActivityLogOpen) {
      fetchActivityLogs(
        "https://sales.baliyoventures.com/api/sales/user-inventory-logs/"
      );
    }
  }, [isActivityLogOpen]);

  const handleTabClick = (tabId: string): void => {
    if (tabId === "activity-log") {
      setIsActivityLogOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  // Format date to a more readable format
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

  // Get color based on action type
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

  // Handle auth error and redirect to login
  const handleAuthError = () => {
    if (typeof window !== "undefined") {
      // Clear the invalid token
      localStorage.removeItem("accessToken");

      // Redirect to login page
      window.location.href = "/login";
    }
  };

  // Function to fetch the next page
  const fetchNextPage = () => {
    if (nextPage) {
      fetchActivityLogs(nextPage);
    }
  };

  // Function to fetch the previous page
  const fetchPreviousPage = () => {
    if (previousPage) {
      fetchActivityLogs(previousPage);
    }
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-4xl font-bold mb-8">Inventory Management</h1>
      <div className="flex flex-wrap gap-4 justify-between">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "flex items-center px-4 py-2 rounded-full border border-gray-300 font-medium transition-colors",
              activeTab === tab.id && tab.id !== "activity-log"
                ? "bg-yellow-100 border-yellow-200"
                : "bg-white hover:bg-gray-50",
              tab.isRightAligned ? "ml-auto" : ""
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "factory" && userRole === Role.SuperAdmin && (
        <FactoryDashboard />
      )}
      {activeTab === "distributors" &&
        (userRole === Role.SuperAdmin || userRole === Role.Distributor) && (
          <ProductInventory />
        )}
      {activeTab === "franchise" &&
        (userRole === Role.SuperAdmin ||
          userRole === Role.Distributor ||
          userRole === Role.Franchise) && <StockManagement />}

      {/* Activity Log Side Sheet */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto",
          isActivityLogOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Activity Log</h2>
            <button
              onClick={() => setIsActivityLogOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Refresh button */}
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
                            changed from {log.old_quantity} to{" "}
                            {log.new_quantity} units
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

          {/* Pagination buttons */}
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

      {/* Overlay when sheet is open */}
      {isActivityLogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsActivityLogOpen(false)}
        />
      )}
    </div>
  );
};

export default InventoryDashboard;

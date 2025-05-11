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
import ActivityLog from "./ActivityLog";

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

  const handleTabClick = (tabId: string): void => {
    if (tabId === "activity-log") {
      setIsActivityLogOpen(true);
    } else {
      setActiveTab(tabId);
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
      <ActivityLog
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
      />

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

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Factory, TruckIcon } from "lucide-react";
import { MdStorefront } from "react-icons/md";
import FactoryDashboard from "@/components/inventory/factory/FactoryDashboard";
import ProductInventory from "@/components/inventory/distributor/ProductInventory";
import StockManagement from "@/components/inventory/franchise/StockManagement";

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState("factory");

  const tabs = [
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
  ];

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8">Inventory Management</h1>
      <div className="flex flex-wrap gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center px-4 py-2 rounded-full border border-gray-300 font-medium transition-colors",
              activeTab === tab.id
                ? "bg-yellow-100 border-yellow-200"
                : "bg-white hover:bg-gray-50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "factory" && <FactoryDashboard />}
      {activeTab === "distributors" && <ProductInventory />}
      {activeTab === "franchise" && <StockManagement />}
    </div>
  );
};

export default InventoryDashboard;

"use client";

import { useState } from "react";
import { Leaf, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import RawMaterialsInventory from "./RawMaterialsInventory";
import FinishedProductsInventory from "./FinishedProductsInventory";

const FactoryDashboard = () => {
  const [activeTab, setActiveTab] = useState("raw-materials");

  const navItems = [
    {
      id: "raw-materials",
      label: "Raw Materials",
      icon: <Leaf className="h-5 w-5 mr-2" />,
      content: <RawMaterialsInventory />,
    },
    {
      id: "finished-products",
      label: "Finished Products",
      icon: <Package className="h-5 w-5 mr-2" />,
      content: <FinishedProductsInventory />,
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-56 mt-6 bg-gray-50 rounded ">
        <div className="p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center w-full py-3 px-4 text-left rounded-md mb-1 font-medium",
                activeTab === item.id
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        {navItems.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default FactoryDashboard;

"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, Package, ClipboardList, TruckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import RawMaterialsInventory from "./RawMaterialsInventory";
import FinishedProductsInventory from "./FinishedProductsInventory";
import BottleCaseInventory from "./BottleCaseInventory";
import StickerCaseInventory from "./StickerCaseInventory";
import DispatchManagement from "./DispatchManagement";

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
    {
      id: "bottle-case",
      label: "Bottle Case",
      icon: <Package className="h-5 w-5 mr-2" />,
      content: <BottleCaseInventory />,
    },
    {
      id: "sticker-case",
      label: "Sticker Case",
      icon: <Package className="h-5 w-5 mr-2" />,
      content: <StickerCaseInventory />,
    },
  ];

  return (
    <div className="flex h-screen sm:flex-row flex-col">
      {/* Sidebar */}
      <div className="w-full mt-6 bg-gray-50 rounded sm:w-56 ">
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
      <div className="flex-1 py-6 ">
        {navItems.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default FactoryDashboard;

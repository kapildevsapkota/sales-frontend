"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { HomeIcon, PlusCircleIcon, ClipboardListIcon } from "lucide-react";

// Define TypeScript interfaces
interface TabItem {
  label: string;
  icon?: React.ReactNode;
  path: string;
}

interface TabBarProps {
  tabs?: TabItem[];
  defaultActive?: number;
  onTabChange?: (index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  defaultActive = 0,
  onTabChange,
}) => {
  // Default tabs if none provided
  const defaultTabs: TabItem[] = [
    {
      label: "Home",
      icon: <HomeIcon size={16} />,
      path: "/sales/dashboard",
    },
    {
      label: "Create Order",
      icon: <PlusCircleIcon size={16} />,
      path: "/sales/orders/create",
    },
    {
      label: "View Orders",
      icon: <ClipboardListIcon size={16} />,
      path: "/sales/orders",
    },
  ];

  // Use provided tabs or default tabs
  const tabItems = tabs || defaultTabs;

  const [activeTab, setActiveTab] = useState(defaultActive);
  const router = useRouter();
  const pathname = usePathname();

  // Find current active tab based on pathname
  useEffect(() => {
    if (pathname) {
      const tabIndex = tabItems.findIndex((tab) => tab.path === pathname);
      if (tabIndex !== -1) {
        setActiveTab(tabIndex);
      }
    }
  }, [pathname, tabItems]);

  const handleTabClick = (index: number, path: string) => {
    setActiveTab(index);

    // Navigate to the path using the App Router
    router.push(path);

    // Call onTabChange if provided
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <div className="flex  p-1 max-w-md mx-auto">
      {tabItems.map((tab, index) => (
        <button
          key={index}
          onClick={() => handleTabClick(index, tab.path)}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === index
              ? "bg-black text-white"
              : "text-gray-800 hover:bg-blue-100"
          } flex-1 mx-1 flex items-center justify-center`}
        >
          {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;

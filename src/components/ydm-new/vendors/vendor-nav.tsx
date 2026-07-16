"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  RotateCcw,
  Receipt,
  FileBarChart,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const BASE = "/admin/ydm/dashboard";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: BASE },
  { icon: Package, label: "Orders", href: `${BASE}/orders/my-orders` },
  { icon: RotateCcw, label: "Return Pending", href: `${BASE}/return-pending` },
  { icon: Receipt, label: "Invoice", href: `${BASE}/invoice` },
  { icon: FileBarChart, label: "Statement", href: `${BASE}/statement` },
];

export function VendorNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="shrink-0 bg-white rounded-xs border border-gray-100 mb-2">
      <nav
        className="
          flex items-center gap-1 sm:gap-2
          px-2 sm:px-4 py-2 sm:py-3
          overflow-x-auto
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Button
              key={item.label}
              onClick={() => router.push(item.href)}
              variant={isActive ? "secondary" : "ghost"}
              className="rounded-xs shrink-0 gap-1.5 px-2.5 sm:px-3 whitespace-nowrap"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </header>
  );
}

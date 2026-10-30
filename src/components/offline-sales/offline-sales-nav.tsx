"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Users, CalendarCheck, Sliders, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const offlineSalesTabs = [
  {
    name: "Orders",
    href: "/super-admin/offline-sales/orders",
    icon: ShoppingBag,
    description: "Manage and track all offline sales orders",
  },
  {
    name: "Customers",
    href: "/super-admin/offline-sales/customers",
    icon: Users,
    description: "Field clients and customer directory",
  },
  {
    name: "Attendance",
    href: "/super-admin/offline-sales/attendance",
    icon: CalendarCheck,
    description: "Daily field agent attendance tracking",
  },
  {
    name: "Config",
    href: "/super-admin/offline-sales/config",
    icon: Sliders,
    description: "Offline sales rules, targets and parameters",
  },
];

export function OfflineSalesNav() {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-neutral-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 flex-shrink-0">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Offline Sales
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive control over field operations, orders, staff attendance, and settings.
            </p>
          </div>
        </div>

        {/* Quick Tabs on larger screens / mobile wrap */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl overflow-x-auto">
          {offlineSalesTabs.map((tab) => {
            const isActive = pathname === tab.href || (pathname.startsWith(tab.href) && tab.href !== "/super-admin/offline-sales");
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400")} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


"use client";

import { Button } from "@/components/ui/button";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

export function YDMNavigation() {
  const { id } = useParams();
  const pathname = usePathname();

  const dashboardId = Array.isArray(id) ? id[0] : id;
  const basePath = dashboardId ? `/admin/ydm/${dashboardId}` : "/admin/ydm";

  const isDashboardPage = pathname === basePath || pathname === `${basePath}/`;
  const isOrdersPage = pathname === `${basePath}/orders`;
  // const isTodayOrdersPage = pathname === `${basePath}/today-orders`;

  const navigationItems = useMemo(
    () => [
      { href: basePath, label: "Dashboard", isActive: isDashboardPage },
      {
        href: `${basePath}/orders`,
        label: "All Orders",
        isActive: isOrdersPage,
      },
      // {
      //   href: `${basePath}/today-orders`,
      //   label: "Today Orders",
      //   isActive: isTodayOrdersPage,
      // },
    ],
    [basePath, isDashboardPage, isOrdersPage]
  );

  return (
    <div>
      <nav
        aria-label="Primary"
        className="sticky top-0 mx-auto w-full max-w-max rounded-2xl border bg-white/70 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-neutral-900/60 dark:ring-white/10"
      >
        <ul className="flex items-center gap-1">
          {navigationItems.map((item) => {
            const activeClasses =
              "bg-primary text-primary-foreground shadow hover:bg-primary/90";
            const baseClasses =
              "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10";
            return (
              <li key={item.href}>
                <Button
                  asChild
                  size="sm"
                  variant={item.isActive ? "default" : "ghost"}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 data-[active=true]:translate-y-[-1px] ${
                    item.isActive ? activeClasses : baseClasses
                  }`}
                  data-active={item.isActive}
                >
                  <Link
                    href={item.href}
                    prefetch={false}
                    aria-current={item.isActive ? "page" : undefined}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

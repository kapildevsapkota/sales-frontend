"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  ShoppingBag,
  Users,
  CalendarCheck,
  Sliders,
  Store,
  MapPin,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const offlineSalesTabs = [
  {
    name: "Orders",
    href: "/offline-sales/orders",
    icon: ShoppingBag,
    description: "Manage and track all offline sales orders",
  },
  {
    name: "Customers",
    href: "/offline-sales/customers",
    icon: Users,
    description: "Field clients and customer directory",
  },
  {
    name: "Attendance",
    href: "/offline-sales/attendance",
    icon: CalendarCheck,
    description: "Daily field agent attendance tracking",
  },
  {
    name: "Live Tracking",
    href: "/offline-sales/tracking",
    icon: MapPin,
    description: "Live GPS location of field salespersons",
  },
  {
    name: "Config",
    href: "/offline-sales/config",
    icon: Sliders,
    description: "Offline sales rules, targets and parameters",
  },
];

export function OfflineSalesNav() {
  const pathname = usePathname();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const activeTabRef = React.useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Identify current tab
  const activeTab =
    offlineSalesTabs.find(
      (tab) =>
        pathname === tab.href ||
        (pathname.startsWith(tab.href + "/") && tab.href !== "/offline-sales")
    ) || offlineSalesTabs[0];

  // Auto-scroll active tab into center view on mobile / desktop
  React.useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeEl = activeTabRef.current;
      const scrollLeft =
        activeEl.offsetLeft -
        container.offsetWidth / 2 +
        activeEl.offsetWidth / 2;
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  }, [pathname]);

  // Check scroll bounds for edge fade cues
  const checkScroll = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-neutral-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 flex-shrink-0">
            <Store className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Offline Sales
              </h1>
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                Operations
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
              Comprehensive control over field operations, orders, staff attendance, and settings.
            </p>
          </div>
        </div>

        {/* Quick Tabs on Desktop */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-neutral-800 rounded-xl overflow-x-auto">
          {offlineSalesTabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (pathname.startsWith(tab.href + "/") && tab.href !== "/offline-sales");
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white dark:bg-neutral-900 text-purple-700 dark:text-purple-400 shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-neutral-700/50"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400"
                  )}
                />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet Navigation (< md) */}
      <div className="md:hidden space-y-2">
        {/* Mobile Dropdown Quick Selector (shown on extra-small mobile) */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/25">
                    <activeTab.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left truncate">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{activeTab.name}</span>
                      <span className="text-[10px] font-normal text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.2 rounded-full">
                        Current
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {activeTab.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 pl-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">
                  <span className="text-[11px]">Switch</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-[calc(100vw-1.5rem)] max-w-sm p-1.5 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-slate-200 dark:border-neutral-800"
            >
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Select Offline Sales View
              </div>
              {offlineSalesTabs.map((tab) => {
                const isCurrent = tab.href === activeTab.href;
                const Icon = tab.icon;
                return (
                  <DropdownMenuItem key={tab.name} asChild>
                    <Link
                      href={tab.href}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors",
                        isCurrent
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0",
                            isCurrent
                              ? "bg-purple-600 text-white"
                              : "bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-medium">{tab.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {tab.description}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0 ml-2" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scrollable Pill Tabs on Mobile / Tablet */}
        <div className="relative rounded-xl bg-white dark:bg-neutral-900 p-1.5 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
          {/* Left scroll fade cue */}
          {canScrollLeft && (
            <div className="absolute left-1.5 top-1.5 bottom-1.5 w-6 bg-gradient-to-r from-white dark:from-neutral-900 to-transparent pointer-events-none z-10 rounded-l-lg" />
          )}

          {/* Right scroll fade cue */}
          {canScrollRight && (
            <div className="absolute right-1.5 top-1.5 bottom-1.5 w-6 bg-gradient-to-l from-white dark:from-neutral-900 to-transparent pointer-events-none z-10 rounded-r-lg" />
          )}

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5"
          >
            {offlineSalesTabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                (pathname.startsWith(tab.href + "/") && tab.href !== "/offline-sales");
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  ref={isActive ? activeTabRef : null}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 active:scale-95",
                    isActive
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-semibold"
                      : "bg-slate-100/80 dark:bg-neutral-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-neutral-700"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-slate-400 dark:text-slate-400"
                    )}
                  />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


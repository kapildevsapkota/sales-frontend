"use client";

import {
  LayoutDashboard,
  Home,
  UserPlus,
  ChevronDown,
  type LucideIcon,
  LogOut,
  Menu,
  Users,
  Key,
  Calendar,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth, Role } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  isActive?: boolean;
  items?: {
    label: string;
    href: string;
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visible?: (user: any, hasSalesFest?: boolean | null) => boolean;
}

// Menu items will be defined inside the component to access state (hasSalesFest)

export function AppHeader() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [hasSalesFest, setHasSalesFest] = React.useState<boolean | null>(null);

  // Load fest-config for current user's franchise to know if Sales Fest is enabled
  React.useEffect(() => {
    const loadFestConfig = async () => {
      try {
        if (!user?.franchise_id) return;
        const response = await api.get(
          `/api/fest-config/${user.franchise_id}/`
        );
        // expecting shape { has_sales_fest: boolean, ... }
        setHasSalesFest(Boolean(response.data?.has_sales_fest));
      } catch (error) {
        // If it fails, default to false visibility
        setHasSalesFest(false);
        // eslint-disable-next-line no-console
        console.error("Failed to load fest-config:", error);
      }
    };
    loadFestConfig();
  }, [user?.franchise_id]);

  // Listen for immediate updates from the fest-config page toggle
  React.useEffect(() => {
    const handleSalesFestUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ has_sales_fest?: boolean }>;
      if (typeof custom.detail?.has_sales_fest === "boolean") {
        setHasSalesFest(custom.detail.has_sales_fest);
      } else {
        try {
          const stored = window.localStorage.getItem("has_sales_fest");
          if (stored !== null) setHasSalesFest(Boolean(JSON.parse(stored)));
        } catch (error) {
          // ignore
          console.error("Failed to load sales fest:", error);
        }
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener(
        "salesfest:updated",
        handleSalesFestUpdated as EventListener
      );
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "salesfest:updated",
          handleSalesFestUpdated as EventListener
        );
      }
    };
  }, []);

  // Menu items with access to hasSalesFest
  const items: MenuItem[] = React.useMemo(
    () => [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
      },
      {
        label: "Sales",
        icon: Home,
        href: "/admin/salesList",
      },
      {
        label: "Inventory",
        icon: Home,
        href: "/admin/inventory",
      },
      {
        label: "User Management",
        icon: UserPlus,
        href: "/admin/usermanagement",
      },
      {
        label: "Sales Persons",
        icon: Users,
        href: "/admin/salesPersons",
      },
      {
        label: "YDM",
        icon: Home,
        href: "/admin/ydm",
      },
      {
        label: "Sales Fest",
        icon: Calendar,
        href: "/admin/salesfest",
        visible: (u) =>
          !!u &&
          (u.role === Role.SuperAdmin ||
            u.role === Role.Distributor ||
            u.role === Role.Franchise) &&
          typeof u.phone_number === "string" &&
          u.phone_number.replace(/\D/g, "") === "9841751148",
      },
      {
        label: "Fest Groups",
        icon: Users,
        href: "/admin/festgroups",
        visible: (u) =>
          !!u &&
          (u.role === Role.SuperAdmin ||
            u.role === Role.Distributor ||
            u.role === Role.Franchise) &&
          typeof u.phone_number === "string" &&
          u.phone_number.replace(/\D/g, "") === "9841751148",
      },
      {
        label: "Sales Groups",
        icon: Users,
        href: "/admin/salesgroup",
        visible: (_u, fest) => fest === true,
      },
    ],
    [hasSalesFest]
  );

  const visibleItems = React.useMemo(
    () =>
      items.filter((item) =>
        item.visible ? item.visible(user, hasSalesFest) : true
      ),
    [items, user, hasSalesFest]
  );

  // Close Sheet on nav change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20  w-full border-b bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800">
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center gap-2">
              <Image
                src="/image.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-9 w-9 rounded-lg shadow"
              />
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:space-x-2 ml-6">
              {visibleItems.map((item) => (
                <div key={item.label} className="relative px-1">
                  {item.items ? (
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex h-10 items-center gap-1.5 rounded-md px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <item.icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.label}
                          </span>
                          <ChevronDown className="ml-0.5 h-4 w-4 text-gray-500 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 dark:text-gray-400" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="absolute left-0 top-full z-10 mt-1 min-w-[180px] overflow-hidden rounded-md border bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700">
                        <div className="p-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                "flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors",
                                pathname === subItem.href &&
                                  "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              )}
                            >
                              <span className="truncate">{subItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Button
                      variant="ghost"
                      className="flex h-10 items-center gap-1.5 rounded-md px-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      asChild
                    >
                      <Link
                        href={item.href!}
                        className={cn(
                          "flex items-center",
                          pathname === item.href
                            ? "font-medium text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 mr-1.5",
                            pathname === item.href
                              ? "text-blue-500 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                        />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Desktop User Profile Dropdown */}
          <div className="hidden md:flex">
            <UserProfileDropdown />
          </div>

          {/* Mobile Sheet Trigger */}
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden ml-2 p-1"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[80vw] max-w-xs">
                <div className="flex flex-col h-full">
                  <SheetHeader className="px-6 pt-6 pb-2 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/image.png" alt="Logo" />
                        <AvatarFallback>SH</AvatarFallback>
                      </Avatar>
                      <SheetTitle className="text-lg font-bold tracking-tight text-gray-800 dark:text-gray-100">
                        SalesHub
                      </SheetTitle>
                    </div>
                  </SheetHeader>
                  <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
                    {visibleItems.map((item) => (
                      <React.Fragment key={item.label}>
                        {item.items ? (
                          <Collapsible className="w-full">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md"
                              >
                                <div className="flex items-center">
                                  <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  {item.label}
                                </div>
                                <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-1 pl-10 pt-2">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={cn(
                                      "block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                                      pathname === subItem.href &&
                                        "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    )}
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <Link
                            href={item.href!}
                            className={cn(
                              "flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                              pathname === item.href
                                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                : "text-gray-700 dark:text-gray-300"
                            )}
                          >
                            <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                            {item.label}
                          </Link>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                  <div className="mt-auto border-t px-6 py-4 space-y-2">
                    <Link href="/change-password">
                      <Button
                        variant="ghost"
                        className="flex w-full items-center gap-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Key className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        Change Password
                      </Button>
                    </Link>

                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="flex w-full items-center gap-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}

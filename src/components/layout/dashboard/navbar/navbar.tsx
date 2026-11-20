"use client";

import {
  LayoutDashboard,
  Home,
  UserPlus,
  ChevronDown,
  type LucideIcon,
  Menu,
  Users,
  NotepadText,
  Store,
} from "lucide-react";
import { useOfflineSalesAccess } from "@/hooks/use-offline-sales-access";
import { usePathname } from "next/navigation";
import Link from "next/link";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { FranchiseSwitcher } from "./franchise-switcher";

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
  const { hasAccess: hasOfflineAccess } = useOfflineSalesAccess();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(label);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 150);
  };

  const [hasSalesFest, setHasSalesFest] = React.useState<boolean | null>(null);
  const [hasLuckyDraw, setHasLuckyDraw] = React.useState<boolean | null>(null);

  // Load fest-config for current user's franchise to know if Sales Fest is enabled
  React.useEffect(() => {
    const loadFestConfig = async () => {
      try {
        if (!user?.franchise_id) return;
        const response = await api.get(
          `/api/fest-config/${user.franchise_id}/`,
        );
        // expecting shape { has_sales_fest: boolean, ... }
        const data = response.data?.data ?? response.data;
        setHasSalesFest(Boolean(data?.has_sales_fest));
        if (typeof data?.has_lucky_draw === "boolean") {
          setHasLuckyDraw(Boolean(data.has_lucky_draw));
        }
      } catch (error) {
        // If it fails, default to false visibility
        setHasSalesFest(false);
        setHasLuckyDraw(false);
        // eslint-disable-next-line no-console
        console.error("Failed to load fest-config:", error);
      }
    };
    loadFestConfig();
  }, [user?.franchise_id]);

  // Listen for immediate updates from the fest-config page toggle
  React.useEffect(() => {
    const handleSalesFestUpdated = (e: Event) => {
      const custom = e as CustomEvent<{
        has_sales_fest?: boolean;
        has_lucky_draw?: boolean;
      }>;
      if (typeof custom.detail?.has_sales_fest === "boolean") {
        setHasSalesFest(custom.detail.has_sales_fest);
      }
      if (typeof custom.detail?.has_lucky_draw === "boolean") {
        setHasLuckyDraw(custom.detail.has_lucky_draw);
      }
      if (typeof custom.detail?.has_sales_fest !== "boolean") {
        try {
          const storedFest = window.localStorage.getItem("has_sales_fest");
          if (storedFest !== null)
            setHasSalesFest(Boolean(JSON.parse(storedFest)));
        } catch (error) {
          console.error("Failed to load sales fest:", error);
        }
      }
      if (typeof custom.detail?.has_lucky_draw !== "boolean") {
        try {
          const storedLucky = window.localStorage.getItem("has_lucky_draw");
          if (storedLucky !== null)
            setHasLuckyDraw(Boolean(JSON.parse(storedLucky)));
        } catch (error) {
          console.error("Failed to load lucky draw:", error);
        }
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener(
        "salesfest:updated",
        handleSalesFestUpdated as EventListener,
      );
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "salesfest:updated",
          handleSalesFestUpdated as EventListener,
        );
      }
    };
  }, []);

  // Menu items with access to hasSalesFest/hasLuckyDraw
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
        label: "Treatments",
        icon: NotepadText,
        href: "/admin/treatments",
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
        href: "/admin/ydm/dashboard",
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
      {
        label: "Offline Sales",
        icon: Store,
        href: "/offline-sales/orders",
        items: [
          {
            label: "Orders",
            href: "/offline-sales/orders",
          },
          {
            label: "Customers",
            href: "/offline-sales/customers",
          },
          {
            label: "Attendance",
            href: "/offline-sales/attendance",
          },
          {
            label: "Live Tracking",
            href: "/offline-sales/tracking",
          },
          {
            label: "Config",
            href: "/offline-sales/config",
          },
        ],
        visible: () => Boolean(hasOfflineAccess),
      },
      {
        label: "Reports",
        icon: NotepadText,
        href: "/admin/reports",
      },
    ],
    [hasSalesFest, hasLuckyDraw, hasOfflineAccess],
  );

  const visibleItems = React.useMemo(
    () =>
      items.filter((item) =>
        item.visible ? item.visible(user, hasSalesFest) : true,
      ),
    [items, user, hasSalesFest],
  );

  const mobileSwitcherAnchor = React.useMemo(() => {
    return (
      visibleItems.find((i) => i.label === "Sales Groups") ||
      visibleItems.find((i) => i.label === "Fest Groups") ||
      visibleItems.find((i) => i.label === "YDM") ||
      visibleItems[visibleItems.length - 1]
    );
  }, [visibleItems]);

  // Close Sheet and Menu on nav change
  React.useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

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
            <nav className="hidden lg:flex lg:space-x-1 ml-4">
              {visibleItems.map((item) => {
                const isItemActive =
                  (item.href && (pathname === item.href || pathname.startsWith(item.href + "/"))) ||
                  item.items?.some(
                    (subItem) =>
                      pathname === subItem.href ||
                      pathname.startsWith(subItem.href + "/")
                  );

                return (
                  <div
                    key={item.label}
                    className="relative px-0.5"
                    onMouseEnter={() => item.items && handleMouseEnter(item.label)}
                    onMouseLeave={() => item.items && handleMouseLeave()}
                  >
                    {item.items ? (
                      <DropdownMenu
                        open={openMenu === item.label}
                        onOpenChange={(isOpen) => setOpenMenu(isOpen ? item.label : null)}
                      >
                        <div
                          className={cn(
                            "flex h-9 items-center rounded-md transition-colors",
                            isItemActive
                              ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          )}
                        >
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="flex h-full items-center gap-1 pl-2.5 pr-1 text-xs"
                            >
                              <item.icon
                                className={cn(
                                  "h-3.5 w-3.5",
                                  isItemActive
                                    ? "text-blue-500 dark:text-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                                )}
                              />
                              <span className="tracking-tight">{item.label}</span>
                            </Link>
                          ) : (
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="flex h-full items-center gap-1 pl-2.5 pr-1 text-xs focus:outline-none"
                              >
                                <item.icon
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    isItemActive
                                      ? "text-blue-500 dark:text-blue-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  )}
                                />
                                <span className="tracking-tight">{item.label}</span>
                              </button>
                            </DropdownMenuTrigger>
                          )}
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex h-full items-center px-1.5 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 rounded-r-md transition-colors focus:outline-none"
                              aria-label={`Open ${item.label} dropdown`}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform duration-200",
                                  openMenu === item.label && "rotate-180",
                                  isItemActive
                                    ? "text-blue-500 dark:text-blue-400"
                                    : "text-gray-500 dark:text-gray-400"
                                )}
                              />
                            </button>
                          </DropdownMenuTrigger>
                        </div>
                        <DropdownMenuContent
                          align="start"
                          className="min-w-[180px] p-1 bg-white rounded-md border shadow-lg dark:bg-gray-900 dark:border-gray-700"
                          sideOffset={4}
                          onMouseEnter={() => handleMouseEnter(item.label)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {item.items.map((subItem) => (
                            <DropdownMenuItem key={subItem.href} asChild>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "flex w-full items-center rounded-md px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer",
                                  (pathname === subItem.href ||
                                    pathname.startsWith(subItem.href + "/")) &&
                                    "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                )}
                              >
                                <span className="truncate">{subItem.label}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="ghost"
                        className="flex h-9 items-center gap-1 rounded-md px-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        asChild
                      >
                        <Link
                          href={item.href!}
                          className={cn(
                            "flex items-center",
                            pathname === item.href
                              ? "font-semibold text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-3.5 w-3.5 mr-1",
                              pathname === item.href
                                ? "text-blue-500 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400",
                            )}
                          />
                          <span className="text-xs tracking-tight">{item.label}</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Desktop User Profile Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <FranchiseSwitcher />
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
                            <div className="flex w-full items-center justify-between rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              {item.href ? (
                                <Link
                                  href={item.href}
                                  className={cn(
                                    "flex flex-1 items-center px-3 py-2 text-base font-medium",
                                    (pathname === item.href || pathname.startsWith(item.href + "/"))
                                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-semibold rounded-md"
                                      : "text-gray-700 dark:text-gray-300"
                                  )}
                                >
                                  <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  {item.label}
                                </Link>
                              ) : (
                                <CollapsibleTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex flex-1 items-center px-3 py-2 text-left text-base font-medium text-gray-700 dark:text-gray-300"
                                  >
                                    <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    {item.label}
                                  </button>
                                </CollapsibleTrigger>
                              )}
                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
                                  aria-label={`Toggle ${item.label} sub-menu`}
                                >
                                  <ChevronDown className="h-5 w-5" />
                                </button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                              <div className="space-y-1 pl-10 pt-2">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={cn(
                                      "block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                                      (pathname === subItem.href ||
                                        pathname.startsWith(subItem.href + "/")) &&
                                        "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
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
                                : "text-gray-700 dark:text-gray-300",
                            )}
                          >
                            <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                            {item.label}
                          </Link>
                        )}

                        {/* Render FranchiseSwitcher after anchor item (Sales Groups / Fest Groups / YDM) */}
                        {item.label === mobileSwitcherAnchor?.label && user?.role === Role.Franchise && (
                          <div className="px-3 py-2 my-2 border-t border-b border-gray-100 dark:border-gray-800">
                            <FranchiseSwitcher className="w-full" />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                  <div className="mt-auto border-t px-6 py-4 bg-gray-50">
                    <div className="mb-3 text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user?.first_name && user?.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user?.username || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.role}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <UserProfileDropdown
                        variant="compact"
                        className="w-full justify-center"
                      />
                    </div>
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

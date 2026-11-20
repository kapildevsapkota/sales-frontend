"use client";

import {
  LayoutDashboard,
  Users,
  Building2,
  ChevronDown,
  type LucideIcon,
  Menu,
  Crown,
  NotepadText,
  Calendar,
  Package,
  Store,
} from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { useOfflineSalesAccess } from "@/hooks/use-offline-sales-access";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  isActive?: boolean;
  items?: {
    label: string;
    href: string;
  }[];
  visible?: (hasOfflineAccess: boolean) => boolean;
}

// Super Admin menu items with comprehensive system management
const superAdminItems: MenuItem[] = [
  {
    label: "Super Dashboard",
    icon: LayoutDashboard,
    href: "/super-admin",
  },
  {
    label: "Orders",
    icon: Package,
    href: "/super-admin/orders",
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
    visible: (hasOfflineAccess) => hasOfflineAccess,
  },
  {
    label: "Inventory",
    icon: Users,
    href: "/super-admin/inventory",
  },
  {
    label: "User Management",
    icon: Users,
    items: [
      {
        label: "All Users",
        href: "/super-admin/usermanagement",
      },
      {
        label: "Create User",
        href: "/super-admin/usermanagement/createuser",
      },
    ],
  },
  {
    label: "Franchise Management",
    icon: Building2,
    href: "/super-admin/organization/franchises",
  },
  {
    label: "Reports",
    icon: NotepadText,
    href: "/super-admin/reports",
  },
  {
    label: "Sales Fest",
    icon: Calendar,
    href: "/super-admin/salesfest",
  },
];

export function SuperAdminHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { hasAccess: hasOfflineAccess } = useOfflineSalesAccess();
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

  const visibleItems = React.useMemo(
    () =>
      superAdminItems.filter((item) =>
        item.visible ? item.visible(hasOfflineAccess) : true
      ),
    [hasOfflineAccess]
  );

  // Close Sheet and Menu on nav change
  React.useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-purple-500/20 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 shadow-md">
      <div className="px-3 sm:px-5 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-2 lg:gap-4">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-3 lg:gap-6 min-w-0">
            <Link
              href="/super-admin"
              className="flex-shrink-0 flex items-center gap-2.5 group"
            >
              <div className="relative">
                <Image
                  src="/image.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-xl shadow-md ring-1 ring-white/20 transition-transform group-hover:scale-105"
                />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                  <Crown className="h-2.5 w-2.5 text-yellow-900" />
                </div>
              </div>
              <div className="hidden sm:block leading-tight">
                <h1 className="text-sm font-semibold tracking-wide text-white drop-shadow-sm">
                  Super Admin
                </h1>
                <p className="text-[11px] font-medium text-purple-200">
                  Control Center
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
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
                    className="relative flex-shrink-0"
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
                            "flex h-9 items-center rounded-lg transition-all",
                            isItemActive
                              ? "bg-white/20 text-white font-semibold shadow-sm"
                              : "text-purple-100 hover:bg-white/15 hover:text-white"
                          )}
                        >
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="flex h-full items-center gap-1.5 pl-2.5 pr-1 text-[13px] font-medium"
                            >
                              <item.icon className="h-3.5 w-3.5 opacity-90" />
                              <span>{item.label}</span>
                            </Link>
                          ) : (
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="flex h-full items-center gap-1.5 pl-2.5 pr-1 text-[13px] font-medium focus:outline-none"
                              >
                                <item.icon className="h-3.5 w-3.5 opacity-90" />
                                <span>{item.label}</span>
                              </button>
                            </DropdownMenuTrigger>
                          )}
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex h-full items-center px-1.5 hover:bg-white/20 rounded-r-lg transition-colors focus:outline-none"
                              aria-label={`Open ${item.label} dropdown`}
                            >
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 opacity-70 transition-transform duration-200",
                                  openMenu === item.label && "rotate-180"
                                )}
                              />
                            </button>
                          </DropdownMenuTrigger>
                        </div>
                        <DropdownMenuContent
                          align="start"
                          className="min-w-[200px] p-1.5 bg-white rounded-xl shadow-xl border border-gray-100"
                          sideOffset={8}
                          onMouseEnter={() => handleMouseEnter(item.label)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {item.items.map((subItem) => (
                            <DropdownMenuItem key={subItem.href} asChild>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer",
                                  (pathname === subItem.href ||
                                    pathname.startsWith(subItem.href + "/")) &&
                                    "bg-purple-50 text-purple-700 font-semibold"
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
                        size="sm"
                        className={cn(
                          "h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-purple-100 hover:bg-white/15 hover:text-white transition-all",
                          pathname === item.href &&
                            "bg-white/20 text-white font-semibold shadow-sm"
                        )}
                        asChild
                      >
                        <Link href={item.href!}>
                          <item.icon className="h-3.5 w-3.5 opacity-90" />
                          <span>{item.label}</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* User Info and Desktop Logout */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:flex items-center rounded-lg hover:bg-white/10 transition-colors p-0.5">
              <UserProfileDropdown />
            </div>

            {/* Mobile Sheet Trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden p-1 text-white hover:bg-white/10"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[85vw] max-w-sm">
                <div className="flex flex-col h-full">
                  <SheetHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/image.png" alt="Logo" />
                          <AvatarFallback className="bg-white text-purple-600 font-bold">
                            SA
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Crown className="h-3 w-3 text-yellow-800" />
                        </div>
                      </div>
                      <div>
                        <SheetTitle className="text-lg font-bold text-white text-left">
                          Super Admin
                        </SheetTitle>
                        <p className="text-sm text-purple-100">
                          System Control
                        </p>
                      </div>
                    </div>
                  </SheetHeader>

                  <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
                    {visibleItems.map((item) => (
                      <React.Fragment key={item.label}>
                        {item.items ? (
                          <Collapsible className="w-full">
                            <div className="flex w-full items-center justify-between rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors">
                              {item.href ? (
                                <Link
                                  href={item.href}
                                  className={cn(
                                    "flex flex-1 items-center px-3 py-3 text-base font-medium",
                                    (pathname === item.href || pathname.startsWith(item.href + "/"))
                                      ? "text-purple-700 bg-purple-100 font-semibold rounded-lg"
                                      : "text-gray-700"
                                  )}
                                >
                                  <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                                  {item.label}
                                </Link>
                              ) : (
                                <CollapsibleTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex flex-1 items-center px-3 py-3 text-left text-base font-medium text-gray-700"
                                  >
                                    <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                                    {item.label}
                                  </button>
                                </CollapsibleTrigger>
                              )}
                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="p-3 text-gray-500 hover:text-purple-700 focus:outline-none"
                                  aria-label={`Toggle ${item.label} menu`}
                                >
                                  <ChevronDown className="h-5 w-5" />
                                </button>
                              </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                              <div className="space-y-1 pl-11 pt-2">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={cn(
                                      "block px-3 py-2 text-sm font-medium rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors",
                                      (pathname === subItem.href ||
                                        pathname.startsWith(subItem.href + "/")) &&
                                        "bg-purple-100 text-purple-700 font-semibold",
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
                              "flex items-center px-3 py-3 text-base font-medium rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors",
                              pathname === item.href
                                ? "text-purple-700 bg-purple-100 font-semibold"
                                : "text-gray-700",
                            )}
                          >
                            <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                            {item.label}
                          </Link>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>

                  <div className="mt-auto border-t px-6 py-4 bg-gray-50">
                    <div className="mb-3 text-center">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.username || "Super Admin"}
                      </p>
                      <p className="text-xs text-gray-500">
                        System Administrator
                      </p>
                    </div>
                    <UserProfileDropdown
                      variant="compact"
                      className="w-full justify-center"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

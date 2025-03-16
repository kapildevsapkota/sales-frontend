"use client";

import {
  LayoutDashboard,
  Home,
  UserPlus,
  ChevronDown,
  type LucideIcon,
  LogOut,
  Menu,
  X,
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
import { useAuth } from "@/providers/auth-provider";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  isActive?: boolean;
  items?: {
    label: string;
    href: string;
  }[];
}

// Menu items with admin routes
const items: MenuItem[] = [
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
    label: "Create User",
    icon: UserPlus,
    href: "/admin/createUser",
  },
];

export function AppHeader() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.clear();
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-6">
              <div className="flex items-center">
                <Image
                  src="/image.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-9 w-9"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:space-x-1">
              {items.map((item) => (
                <div key={item.label} className="relative px-1">
                  {item.items ? (
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex h-10 items-center gap-1.5 rounded-md px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                "flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
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
                      className="flex h-10 items-center gap-1.5 rounded-md px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
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

          {/* Mobile menu button and User menu */}
          <div className="flex items-center">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span>Logout</span>
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
          <div className="space-y-1 pb-3 pt-2">
            {items.map((item) => (
              <div key={item.label} className="px-2">
                {item.items ? (
                  <Collapsible className="w-full">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                              "block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
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
                      "flex items-center px-3 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800",
                      pathname === item.href
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="px-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

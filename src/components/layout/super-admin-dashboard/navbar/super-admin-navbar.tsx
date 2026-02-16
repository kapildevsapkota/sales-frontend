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

// Super Admin menu items with comprehensive system management
const superAdminItems: MenuItem[] = [
  {
    label: "Super Dashboard",
    icon: LayoutDashboard,
    href: "/super-admin",
  },
  // sales only
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
  }
];

export function SuperAdminHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);

  // Close Sheet on nav change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/image.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl shadow-lg"
                />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="h-2.5 w-2.5 text-yellow-800" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">
                  Super Admin Panel
                </h1>
                <p className="text-xs text-purple-100">System Administration</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:space-x-1 ml-8">
              {superAdminItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.items ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-white hover:bg-white/10 hover:text-white transition-colors data-[state=open]:bg-white/20"
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                          <ChevronDown className="ml-0.5 h-4 w-4 transition-transform duration-200" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="min-w-[220px] bg-white shadow-xl border-0"
                        sideOffset={8}
                      >
                        {item.items.map((subItem) => (
                          <DropdownMenuItem key={subItem.href} asChild>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex w-full items-center rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer",
                                pathname === subItem.href &&
                                "bg-purple-100 font-medium text-purple-700"
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
                      className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-white hover:bg-white/10 hover:text-white transition-colors"
                      asChild
                    >
                      <Link
                        href={item.href!}
                        className={cn(
                          "flex items-center",
                          pathname === item.href
                            ? "bg-white/20 font-medium"
                            : ""
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-1.5" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* User Info and Desktop Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex">
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
                    {superAdminItems.map((item) => (
                      <React.Fragment key={item.label}>
                        {item.items ? (
                          <Collapsible className="w-full">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="flex w-full items-center justify-between px-3 py-3 text-left text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                                  {item.label}
                                </div>
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-1 pl-11 pt-2">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={cn(
                                      "block px-3 py-2 text-sm font-medium rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors",
                                      pathname === subItem.href &&
                                      "bg-purple-100 text-purple-700 font-semibold"
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
                                : "text-gray-700"
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

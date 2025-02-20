"use client";

import {
  LayoutDashboard,
  Home,
  MessageCircle,
  ChevronRight,
  type LucideIcon,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
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
    isActive: true,
    items: [
      {
        label: "View Sales",
        href: "/admin/SalesList",
      },
    ],
  },
  {
    label: "Inventory",
    icon: Home,
    isActive: true,
    items: [
      {
        label: "View Inventory",
        href: "/admin/inventoryList",
      },
    ],
  },
  {
    label: "Inquiries",
    icon: MessageCircle,
    href: "/admin/inquiries",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex h-[60px] items-center justify-center px-6 group-[[data-collapsed=true]]:px-2">
          <Image
            src="/image.png"
            alt="Logo"
            width={32}
            height={32}
            className="group-[[data-collapsed=true]]:w-8 group-[[data-collapsed=true]]:h-8"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  {item.items ? (
                    <Collapsible
                      defaultOpen={item.isActive}
                      className="group/collapsible w-full space-y-2"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="w-full justify-between hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                          tooltip={item.label}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium truncate group-[[data-collapsed=true]]:hidden">
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight
                            className="ml-auto h-4 w-4 text-gray-500 transition-transform duration-200 
                              group-data-[state=open]/collapsible:rotate-90 
                              group-[[data-collapsed=true]]:hidden"
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="group-[[data-collapsed=true]]:hidden">
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm hover:bg-gray-100/80 dark:hover:bg-gray-800/50",
                                  pathname === subItem.href &&
                                    "bg-gray-100 font-medium text-blue-600 dark:bg-gray-800"
                                )}
                              >
                                <span className="truncate">
                                  {subItem.label}
                                </span>
                              </Link>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      className="hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                      tooltip={item.label}
                    >
                      <Link
                        href={item.href!}
                        className={cn(
                          "flex items-center gap-3",
                          pathname === item.href &&
                            "bg-gray-100 font-medium text-blue-600 dark:bg-gray-800"
                        )}
                      >
                        <item.icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium truncate group-[[data-collapsed=true]]:hidden">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex h-[60px] items-center justify-center px-6 group-[[data-collapsed=true]]:px-2">
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            title="Logout"
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="group-[[data-collapsed=true]]:hidden">Logout</span>
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

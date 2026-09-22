"use client";

import { Role, useAuth } from "@/contexts/AuthContext";
import { Activity, Users, Package, Wine, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function TreatmentStaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (user?.role !== Role.TreatmentStaff) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-6 max-w-md w-full">
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl text-red-500">🔒</span>
            <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
            <p className="text-gray-500 text-center">
              You are not authorized to access this page.
            </p>
          </div>
          <div className="flex gap-4 w-full">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => logout()}
            >
              Logout
            </Button>
            <Button className="flex-1" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      label: "Customer",
      icon: Users,
      href: "/treatment-staff/dashboard",
      active: pathname === "/treatment-staff/dashboard",
    },
    {
      label: "Package Member",
      icon: Package,
      href: "/treatment-staff/package-member",
      active: pathname.startsWith("/treatment-staff/package-member"),
    },
    {
      label: "Bottle Member",
      icon: Wine,
      href: "/treatment-staff/bottle-member",
      active: pathname.startsWith("/treatment-staff/bottle-member"),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 w-full border-b bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 flex items-center gap-2">
                <Image
                  src="/image.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-9 w-9 rounded-lg shadow"
                />
                <span className="font-semibold text-gray-800 hidden sm:inline-block">
                  Treatment Staff Portal
                </span>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex md:space-x-2 ml-6">
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    variant={item.active ? "secondary" : "ghost"}
                    className={cn(
                      "flex h-10 items-center gap-1.5 rounded-md px-3 hover:bg-gray-100 transition-colors",
                      item.active && "font-medium text-teal-600 bg-teal-50"
                    )}
                    asChild
                  >
                    <Link href={item.href} className="flex items-center">
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>

            {/* Desktop User info & Logout */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hi, <strong className="text-gray-800">{user?.first_name || user?.username}</strong>
              </span>
              <Button
                onClick={() => logout()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4 text-gray-500" />
                <span>Logout</span>
              </Button>
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
                    <Menu className="h-6 w-6 text-gray-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[80vw] max-w-xs">
                  <div className="flex flex-col h-full">
                    <SheetHeader className="px-6 pt-6 pb-2 border-b">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/image.png" alt="Logo" />
                          <AvatarFallback>TS</AvatarFallback>
                        </Avatar>
                        <SheetTitle className="text-lg font-bold tracking-tight text-gray-800">
                          Treatment Staff
                        </SheetTitle>
                      </div>
                    </SheetHeader>
                    <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
                      {menuItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 transition-colors",
                            item.active
                              ? "text-teal-600 bg-teal-50"
                              : "text-gray-700"
                          )}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto border-t px-6 py-4">
                      <Button
                        onClick={() => logout()}
                        variant="ghost"
                        className="flex w-full items-center gap-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-5 w-5 text-gray-500" />
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
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

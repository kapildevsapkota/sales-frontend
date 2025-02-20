"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { requireAuth } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    requireAuth(pathname);
  }, [pathname, requireAuth]);

  return <div className="min-h-screen bg-background">{children}</div>;
}

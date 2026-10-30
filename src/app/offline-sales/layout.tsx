"use client";

import { useAuth, Role } from "@/contexts/AuthContext";
import { useOfflineSalesAccess } from "@/hooks/use-offline-sales-access";
import { SuperAdminHeader } from "@/components/layout/super-admin-dashboard/navbar/super-admin-navbar";
import { AppHeader } from "@/components/layout/dashboard/navbar/navbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

export default function OfflineSalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { hasAccess, isLoading } = useOfflineSalesAccess();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Verifying offline sales access...
          </span>
        </div>
      </div>
    );
  }

  // If user is not logged in or not in access list
  if (!user || !hasAccess) {
    const dashboardRoute =
      user?.role === Role.SuperAdmin ? "/super-admin" : "/admin";

    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 dark:from-neutral-950 dark:to-neutral-900 px-4">
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6 max-w-md w-full border border-slate-200 dark:border-neutral-800 text-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              You do not have permission to access the Offline Sales module.
              Access must be granted to your account by a system administrator.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Button
              className="flex-1 rounded-xl gap-2"
              variant="outline"
              onClick={() => router.push(dashboardRoute)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
            <Button
              className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render role-specific header
  const isSuperAdmin = user.role === Role.SuperAdmin;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-neutral-950">
      {isSuperAdmin ? <SuperAdminHeader /> : <AppHeader />}
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}


"use client";

import { Role, useAuth } from "@/contexts/AuthContext";
import { SuperAdminHeader } from "./navbar/super-admin-navbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Super admin has access to everything, but we still check if user is super admin
  if (!user || user.role !== Role.SuperAdmin) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-6 max-w-md w-full border border-red-100">
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl text-red-600">🔒</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Super Admin Access Required
            </h1>
            <p className="text-gray-600 text-center leading-relaxed">
              This area is restricted to Super Administrators only. Please
              contact your system administrator if you believe this is an error.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => logout()}
            >
              Logout
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => router.push("/")}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SuperAdminHeader />
      <main className="flex-1 w-full">
        <div className="px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

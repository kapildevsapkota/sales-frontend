"use client";

import { Role, useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SalesPersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user?.role !== Role.SalesPerson && user?.role !== Role.Franchise) {
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
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}

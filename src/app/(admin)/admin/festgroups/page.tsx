"use client";

import { SalesFestView } from "@/components/salesfest/salesfest-view";
import { Role, useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function FestGroupsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAllowed = useMemo(() => {
    if (!user) return false;
    const cleaned =
      typeof user.phone_number === "string"
        ? user.phone_number.replace(/\D/g, "")
        : "";
    const roleOk =
      user.role === Role.SuperAdmin ||
      user.role === Role.Distributor ||
      user.role === Role.Franchise;
    return roleOk && cleaned === "9841751148";
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAllowed) {
      router.replace("/admin");
    }
  }, [isLoading, isAllowed, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAllowed) return null;

  return (
    <>
      <SalesFestView />
    </>
  );
}

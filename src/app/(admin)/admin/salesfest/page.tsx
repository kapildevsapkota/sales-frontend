// import { SalesFestView } from "@/components/salesfest/salesfest-view";
// NEXT_PUBLIC_API_URL

"use client";

import InfoForm from "@/components/salesfest/InfoForm";
import { useEffect, useMemo } from "react";
import { useAuth, Role } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SalesFestPage() {
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
    return roleOk && cleaned === "1111111111";
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAllowed) {
      router.replace("/admin");
    }
  }, [isLoading, isAllowed, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAllowed) return null;

  return <InfoForm initialOrgData={null} />;
}

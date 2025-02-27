"use client";

import { useAuth } from "@/contexts/AuthContext"; // Assuming you have this hook
import FactoryInventoryPage from "./factory-inventory/page";
import DistributorInventoryPage from "./distributor-inventory/page";
import { Role } from "@/contexts/AuthContext"; // Assuming you have Role enum defined

const Page = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role !== Role.Distributor && <FactoryInventoryPage />}
      <DistributorInventoryPage />
    </>
  );
};

export default Page;

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FactoryInventoryPage from "@/components/factory-inventory/page";
import DistributorInventoryPage from "@/components/distributorInventory/page";

const Page = () => {
  const { user } = useAuth();

  if (user?.role === Role.Distributor) {
    return <DistributorInventoryPage />;
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Tabs defaultValue="factory" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="factory">Factory Inventory</TabsTrigger>
            <TabsTrigger value="distributor">Distributor Inventory</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="factory" className="mt-0">
          <FactoryInventoryPage />
        </TabsContent>

        <TabsContent value="distributor" className="mt-0">
          <DistributorInventoryPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;

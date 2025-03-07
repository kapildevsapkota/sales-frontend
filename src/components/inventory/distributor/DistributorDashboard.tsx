"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Box,
  Building,
  Package,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import InventoryOverview from "../shared/InventoryOverview";
import ProductInventory from "./ProductInventory";
import RetailersManagement from "./RetailersManagement";
import OrdersManagement from "./OrdersManagement";

const DistributorDashboard = () => {
  const [, setActiveTab] = useState("overview");

  // Mock data for the overview
  const overviewData = {
    inventory: {
      total: 5,
      value: 850000,
      lowStock: 2,
    },
    retailers: {
      total: 24,
      active: 20,
      pending: 4,
    },
    orders: {
      pending: 6,
      inTransit: 3,
      completed: 35,
    },
    sales: {
      daily: 45,
      weekly: 320,
      monthly: 1250,
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Product Inventory
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData.inventory.total} products
            </div>
            <p className="text-xs text-muted-foreground">
              {overviewData.inventory.lowStock} items low in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retailers</CardTitle>
            <Store className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData.retailers.total} retailers
            </div>
            <p className="text-xs text-muted-foreground">
              {overviewData.retailers.active} active,{" "}
              {overviewData.retailers.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData.orders.pending} pending
            </div>
            <p className="text-xs text-muted-foreground">
              {overviewData.orders.inTransit} in transit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData.sales.daily} units/day
            </div>
            <p className="text-xs text-muted-foreground">
              {overviewData.sales.monthly} units this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="overview"
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="retailers" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Retailers</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <InventoryOverview
            title="Distributor Inventory Overview"
            description="Comprehensive view of your inventory, retailers, and orders."
            data={overviewData}
            role="distributor"
          />
        </TabsContent>

        <TabsContent value="inventory">
          <ProductInventory />
        </TabsContent>

        <TabsContent value="retailers">
          <RetailersManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DistributorDashboard;

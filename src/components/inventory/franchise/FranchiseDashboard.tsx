"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Box,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import InventoryOverview from "../shared/InventoryOverview";
import StockManagement from "./StockManagement";
import SalesManagement from "./SalesManagement";
import OrderRequests from "./OrderRequests";

const FranchiseDashboard = () => {
  const [, setActiveTab] = useState("overview");

  // Mock data for the overview
  const overviewData = {
    inventory: {
      total: 5,
      value: 320000,
      lowStock: 1,
    },
    sales: {
      daily: 25,
      weekly: 180,
      monthly: 750,
    },
    orders: {
      pending: 2,
      inTransit: 1,
      completed: 15,
    },
    customers: {
      total: 120,
      new: 8,
      returning: 112,
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stock Inventory
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
            <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData.sales.daily} units
            </div>
            <p className="text-xs text-muted-foreground">
              {overviewData.sales.weekly} units this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
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
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewData.customers.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {overviewData.customers.new} new this week
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
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            <span className="hidden sm:inline">Stock</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Sales</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Order Requests</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <InventoryOverview
            title="Franchise Inventory Overview"
            description="Comprehensive view of your stock, sales, and orders."
            data={overviewData}
            role="franchise"
          />
        </TabsContent>

        <TabsContent value="stock">
          <StockManagement />
        </TabsContent>

        <TabsContent value="sales">
          <SalesManagement />
        </TabsContent>

        <TabsContent value="orders">
          <OrderRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FranchiseDashboard;

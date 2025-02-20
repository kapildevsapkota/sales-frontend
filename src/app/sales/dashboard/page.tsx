"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stats } from "@/components/stats";

export default function SalesDashboard() {
  const router = useRouter();

  const handleCreateOrder = () => {
    router.push("/sales/orders/create");
  };

  const handleViewOrders = () => {
    router.push("/sales/orders");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Sales Dashboard</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateOrder}
        >
          <Card className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardHeader>
              <CardTitle>Create Order</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ShoppingBag className="h-24 w-24" />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleViewOrders}
        >
          <Card className="cursor-pointer bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <CardHeader>
              <CardTitle>View Orders</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <FileText className="h-24 w-24" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div className="mt-8">
        <Stats />
      </div>
    </div>
  );
}

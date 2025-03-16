"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, FileText, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stats } from "@/components/stats";
import { useAuth } from "@/contexts/AuthContext";

export default function SalesDashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleCreateOrder = () => {
    router.push("/sales/create");
  };

  const handleViewOrders = () => {
    router.push("/sales/orders");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Sales Dashboard</h1>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
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

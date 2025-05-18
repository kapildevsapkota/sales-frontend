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
    <div className="container mx-auto px-4 py-12 min-h-screen ">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
          Sales Dashboard
        </h1>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <motion.div
          whileHover={{
            scale: 1.04,
            boxShadow: "0 8px 32px rgba(80,80,200,0.15)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateOrder}
        >
          <Card className="cursor-pointer bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 text-white shadow-xl border-0 transition-transform duration-200 hover:shadow-2xl">
            <CardHeader className="flex flex-col items-center">
              <CardTitle className="text-2xl font-semibold tracking-wide">
                Create Order
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ShoppingBag className="h-20 w-20 mb-4 drop-shadow-lg" />
              <span className="text-lg opacity-80">
                Start a new sales order
              </span>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          whileHover={{
            scale: 1.04,
            boxShadow: "0 8px 32px rgba(40,200,160,0.15)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleViewOrders}
        >
          <Card className="cursor-pointer bg-gradient-to-br from-green-500 via-teal-500 to-cyan-500 text-white shadow-xl border-0 transition-transform duration-200 hover:shadow-2xl">
            <CardHeader className="flex flex-col items-center">
              <CardTitle className="text-2xl font-semibold tracking-wide">
                View Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-20 w-20 mb-4 drop-shadow-lg" />
              <span className="text-lg opacity-80">
                Browse and manage orders
              </span>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div className="mt-14">
        <Stats />
      </div>
    </div>
  );
}

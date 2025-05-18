"use client";

import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductsSold } from "./ProductsSold";
import { SalesPersonSalesOverview } from "./SalesPersonSalesOverview";

interface ProductSale {
  product_name: string;
  quantity_sold: number;
}

interface SalesStats {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    role: string;
    franchise: string;
  };
  total_orders: number;
  total_amount: string;
  product_sales: ProductSale[];
}

export function SalesPersonPage() {
  const params = useParams();
  const phoneNumber = params?.phoneNumber as string;

  const [userStats, setUserStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(
          `/api/sales/salesperson/${phoneNumber}/statistics/`
        );
        setUserStats(response.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setUserStats(null);
      } finally {
        setLoading(false);
      }
    };

    if (phoneNumber) {
      fetchStats();
    }
  }, [phoneNumber]);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold">Loading stats...</h2>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">
          User not found or failed to load data
        </h2>
      </div>
    );
  }

  const { user, total_orders, total_amount, product_sales } = userStats;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="bg-white p-6 rounded-xl space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {user.first_name} {user.last_name}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">📞 Phone:</span>
            <span>{user.phone_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">🏢 Franchise:</span>
            <span>{user.franchise}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">
              🧾 Total Orders:
            </span>
            <span>{total_orders}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">
              💰 Total Revenue:
            </span>
            <span className="text-green-600 font-semibold">
              Nrs. {total_amount}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[2px] w-full bg-gray-300 rounded" />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SalesPersonSalesOverview phoneNumber={phoneNumber} />
        </div>
        <div className="lg:col-span-3">
          <ProductsSold product_sales={product_sales} />
        </div>
      </div>
    </div>
  );
}

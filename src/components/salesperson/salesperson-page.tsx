"use client";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductsSold } from "./ProductsSold";
import { SalesPersonSalesOverview } from "./SalesPersonSalesOverview";
import { SalespersonFilter } from "./SalespersonFilter";
import { Timeframe } from "@/components/dashboard/types";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

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
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [filteredProductSales, setFilteredProductSales] = useState<
    ProductSale[]
  >([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filteredStats, setFilteredStats] = useState<{
    total_orders: number;
    total_amount: string;
  } | null>(null);

  // Function to build query parameters for filtered data
  const buildFilteredQueryParams = () => {
    let queryParams = "";

    // Only add timeframe if date range is selected
    if (dateRange?.from) {
      queryParams = `filter=${timeframe}`;
      queryParams += `&date=${format(dateRange.from, "yyyy-MM-dd")}`;
      if (dateRange.to) {
        queryParams += `&end_date=${format(dateRange.to, "yyyy-MM-dd")}`;
      }
    }

    return queryParams;
  };

  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!phoneNumber) return;

      setLoading(true);
      try {
        const response = await api.get(
          `/api/sales/salesperson/${phoneNumber}/statistics/`
        );
        setUserStats(response.data);
        setFilteredProductSales(response.data.product_sales);
        setFilteredStats({
          total_orders: response.data.total_orders,
          total_amount: response.data.total_amount,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setUserStats(null);
        setFilteredStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [phoneNumber]);

  // Fetch filtered data when timeframe or date range changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (!phoneNumber) return;

      try {
        const queryParams = buildFilteredQueryParams();
        // If no date range is selected, use the initial stats
        if (!queryParams) {
          setFilteredProductSales(userStats?.product_sales || []);
          setFilteredStats({
            total_orders: userStats?.total_orders || 0,
            total_amount: userStats?.total_amount || "0",
          });
          return;
        }

        const response = await api.get(
          `/api/sales/salesperson/${phoneNumber}/statistics/?${queryParams}`
        );
        setFilteredProductSales(response.data.product_sales);
        setFilteredStats({
          total_orders: response.data.total_orders,
          total_amount: response.data.total_amount,
        });
      } catch (error) {
        console.error("Failed to fetch filtered data:", error);
        // Fallback to the original stats if available
        if (userStats) {
          setFilteredProductSales(userStats.product_sales);
          setFilteredStats({
            total_orders: userStats.total_orders,
            total_amount: userStats.total_amount,
          });
        }
      }
    };

    fetchFilteredData();
  }, [timeframe, dateRange, phoneNumber, userStats]);

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

  const { user } = userStats;
  const displayStats = filteredStats || {
    total_orders: userStats.total_orders,
    total_amount: userStats.total_amount,
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className=" p-5 sm:p-6 w-full max-w-xl space-y-4">
        {/* Name Header */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {user.first_name} {user.last_name}
          </h2>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-700">
          {/* Phone */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📞</span>
            <span className="font-medium text-gray-600">Phone:</span>
            <span className="truncate">{user.phone_number}</span>
          </div>

          {/* Franchise */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🏢</span>
            <span className="font-medium text-gray-600">Franchise:</span>
            <span>{user.franchise}</span>
          </div>

          {/* Total Orders */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🧾</span>
            <span className="font-medium text-gray-600">Orders:</span>
            <span>{displayStats.total_orders}</span>
          </div>

          {/* Total Revenue */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400">💰</span>
            <span className="font-medium text-gray-600">Revenue:</span>
            <span className="text-green-600 font-semibold">
              Nrs. {displayStats.total_amount}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[2px] w-full bg-gray-300 rounded" />
      <div>
        <SalespersonFilter
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SalesPersonSalesOverview
            phoneNumber={phoneNumber}
            timeframe={timeframe}
            dateRange={undefined}
          />
        </div>
        <div className="lg:col-span-3">
          <ProductsSold
            product_sales={filteredProductSales}
            dateRange={dateRange}
          />
        </div>
      </div>
    </div>
  );
}

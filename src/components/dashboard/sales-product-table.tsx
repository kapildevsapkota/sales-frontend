import { useEffect, useState } from "react";

import { Timeframe } from "./types";
import { DateRange } from "react-day-picker";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ProductsSold } from "../salesperson/ProductsSold";
import { CancelledProducts } from "../salesperson/CancelledProducts";
import { SalespersonFilter } from "../salesperson/SalespersonFilter";
import { format } from "date-fns";

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
  total_cancelled_orders: number;
  total_cancelled_amount: string;
  product_sales: ProductSale[];
  cancelled_product_sales: ProductSale[];
}

export function SalesProductTable() {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [userStats, setUserStats] = useState<SalesStats | null>(null);
  const [filteredProductSales, setFilteredProductSales] = useState<
    ProductSale[]
  >([]);
  const [filteredCancelledProductSales, setFilteredCancelledProductSales] =
    useState<ProductSale[]>([]);

  // Function to build query parameters for filtered data
  const buildFilteredQueryParams = () => {
    let queryParams = "";

    // Always add timeframe filter
    queryParams = `filter=${timeframe}`;

    // Add date range parameters if selected
    if (dateRange?.from) {
      queryParams += `&date=${format(dateRange.from, "yyyy-MM-dd")}`;
      if (dateRange.to) {
        queryParams += `&end_date=${format(dateRange.to, "yyyy-MM-dd")}`;
      }
    }

    return queryParams;
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!phoneNumber) return;

      try {
        const response = await api.get(
          `/api/sales/salesperson/${phoneNumber}/statistics/`
        );
        setUserStats(response.data);
        setFilteredProductSales(response.data.product_sales);
        setFilteredCancelledProductSales(response.data.cancelled_product_sales);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setUserStats(null);
      }
    };

    fetchStats();
  }, [phoneNumber]);

  // Fetch filtered data when timeframe or date range changes
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (!phoneNumber || !userStats) return;

      try {
        const queryParams = buildFilteredQueryParams();
        const response = await api.get(
          `/api/sales/salesperson/${phoneNumber}/statistics/?${queryParams}`
        );
        setFilteredProductSales(response.data.product_sales);
        setFilteredCancelledProductSales(response.data.cancelled_product_sales);
      } catch (error) {
        console.error("Failed to fetch filtered data:", error);
        // Fallback to the original stats if available
        if (userStats) {
          setFilteredProductSales(userStats.product_sales);
          setFilteredCancelledProductSales(userStats.cancelled_product_sales);
        }
      }
    };

    fetchFilteredData();
  }, [timeframe, dateRange, phoneNumber, userStats]);

  return (
    <>
      <div className="flex justify-end">
        <SalespersonFilter
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>
      <div className="space-y-4 w-full flex gap-4 flex-wrap sm:flex-nowrap">
        <ProductsSold
          product_sales={filteredProductSales}
          dateRange={dateRange}
        />
        <CancelledProducts
          product_sales={filteredCancelledProductSales}
          dateRange={dateRange}
        />
      </div>
    </>
  );
}

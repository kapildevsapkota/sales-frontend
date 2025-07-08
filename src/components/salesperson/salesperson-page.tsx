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
import { CancelledProducts } from "./CancelledProducts";
import { X } from "lucide-react";

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

export function SalesPersonPage() {
  const params = useParams();
  const phoneNumber = params?.phoneNumber as string;
  const [userStats, setUserStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [filteredProductSales, setFilteredProductSales] = useState<
    ProductSale[]
  >([]);
  const [filteredCancelledProductSales, setFilteredCancelledProductSales] =
    useState<ProductSale[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filteredStats, setFilteredStats] = useState<{
    total_orders: number;
    total_amount: string;
    total_cancelled_orders: number;
    total_cancelled_amount: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        setFilteredCancelledProductSales(response.data.cancelled_product_sales);
        setFilteredStats({
          total_orders: response.data.total_orders,
          total_amount: response.data.total_amount,
          total_cancelled_orders: response.data.total_cancelled_orders,
          total_cancelled_amount: response.data.total_cancelled_amount,
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
          setFilteredCancelledProductSales(
            userStats?.cancelled_product_sales || []
          );
          setFilteredStats({
            total_orders: userStats?.total_orders || 0,
            total_amount: userStats?.total_amount || "0",
            total_cancelled_orders: userStats?.total_cancelled_orders || 0,
            total_cancelled_amount: userStats?.total_cancelled_amount || "0",
          });
          return;
        }

        const response = await api.get(
          `/api/sales/salesperson/${phoneNumber}/statistics/?${queryParams}`
        );
        setFilteredProductSales(response.data.product_sales);
        setFilteredCancelledProductSales(response.data.cancelled_product_sales);
        setFilteredStats({
          total_orders: response.data.total_orders,
          total_amount: response.data.total_amount,
          total_cancelled_orders: response.data.total_cancelled_orders,
          total_cancelled_amount: response.data.total_cancelled_amount,
        });
      } catch (error) {
        console.error("Failed to fetch filtered data:", error);
        // Fallback to the original stats if available
        if (userStats) {
          setFilteredProductSales(userStats.product_sales);
          setFilteredCancelledProductSales(userStats.cancelled_product_sales);
          setFilteredStats({
            total_orders: userStats.total_orders,
            total_amount: userStats.total_amount,
            total_cancelled_orders: userStats.total_cancelled_orders,
            total_cancelled_amount: userStats.total_cancelled_amount,
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
    total_cancelled_orders: userStats.total_cancelled_orders,
    total_cancelled_amount: userStats.total_cancelled_amount,
  };

  const handleExport = async () => {
    const queryParams = buildFilteredQueryParams();
    if (!queryParams) {
      return;
    }
    try {
      const response = await api.get(
        `/api/sales/salesperson/${phoneNumber}/export-orders/?${queryParams}`,
        { responseType: "blob" }
      );
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `sales-report-${format(
          dateRange?.from || new Date(),
          "yyyy-MM-dd"
        )}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Select a date range both start and end date to export data");
      console.error("Failed to export data:", error);
    }
  };

  return (
    <>
      {error && (
        <div className="p-2 w-3/4 mt-2 space-x-2 mx-auto bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">{error}</h2>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4 cursor-pointer text-red-700" />
          </button>
        </div>
      )}
      <div className="container mx-auto p-4 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          {/* Name and Export Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              {user.first_name} {user.last_name}
            </h2>
            {dateRange?.from && (
              <button
                onClick={handleExport}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors self-start sm:self-auto"
              >
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
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
              <span className="truncate">{user.franchise}</span>
            </div>

            {/* Total Orders */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🧾</span>
              <span className="font-medium text-gray-600">Orders:</span>
              <span className="font-semibold">{displayStats.total_orders}</span>
            </div>

            {/* Total Revenue */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">💰</span>
              <span className="font-medium text-gray-600">Revenue:</span>
              <span className="text-green-600 font-semibold">
                Nrs. {displayStats.total_amount}
              </span>
            </div>

            {/* Canceled Orders */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🚫</span>
              <span className="font-medium text-gray-600">Canceled:</span>
              <span className="font-semibold">
                {displayStats.total_cancelled_orders}
              </span>
            </div>

            {/* Cancelled Revenue */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">💸</span>
              <span className="font-medium text-gray-600">Lost Revenue:</span>
              <span className="text-red-600 font-semibold">
                Nrs. {displayStats.total_cancelled_amount}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <SalespersonFilter
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>

        {/* Charts and Data Section */}
        <div className="space-y-6">
          {/* Sales Overview Chart - Full Width */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <SalesPersonSalesOverview
              phoneNumber={phoneNumber}
              timeframe={timeframe}
              dateRange={dateRange}
            />
          </div>

          {/* Products Section - Side by Side Below Chart */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Products Sold */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <ProductsSold
                product_sales={filteredProductSales}
                dateRange={dateRange}
              />
            </div>

            {/* Cancelled Products */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <CancelledProducts
                product_sales={filteredCancelledProductSales}
                dateRange={dateRange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

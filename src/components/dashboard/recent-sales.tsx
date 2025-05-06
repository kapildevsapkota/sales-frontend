"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Define the type for a product sale
interface ProductSale {
  product_name: string;
  quantity_sold: number;
}

// Define the type for a salesperson
interface Salesperson {
  first_name: string;
  last_name: string;
  total_sales: number;
  sales_count: number;
  product_sales: ProductSale[];
}

// Define the type for the API response
interface SalesResponse {
  filter_type: "all" | "daily" | "weekly" | "monthly";
  results: Salesperson[];
}

export function RecentSales() {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly">(
    "daily"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalespersons = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `https://sales.baliyoventures.com/api/sales/top-salespersons/?filter=${filter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: SalesResponse = await response.json();
        setSalespersons(data.results);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalespersons();
  }, [filter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 sm:h-64 text-base sm:text-lg">
        Loading...
      </div>
    );
  }

  // Prepare data for grouped bar chart (group by salesperson)
  // Get all unique product names
  const allProductNames = Array.from(
    new Set(
      salespersons.flatMap((sp) =>
        sp.product_sales.map((ps) => ps.product_name)
      )
    )
  );

  // Build chart data: one entry per salesperson, with each product's quantity as a key
  const chartData = salespersons.map((sp) => {
    const entry: any = { salesperson: `${sp.first_name} ${sp.last_name}` };
    allProductNames.forEach((product) => {
      const found = sp.product_sales.find((ps) => ps.product_name === product);
      entry[product] = found ? found.quantity_sold : 0;
    });
    return entry;
  });

  // Generate colors for bars (products)
  const barColors = [
    "#4F46E5",
    "#F59E42",
    "#10B981",
    "#EF4444",
    "#6366F1",
    "#F472B6",
    "#FBBF24",
    "#3B82F6",
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
        {(["all", "daily", "weekly", "monthly"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="w-full h-[400px] bg-white rounded-2xl shadow-sm p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
          >
            <XAxis
              dataKey="salesperson"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {allProductNames.map((product, idx) => (
              <Bar
                key={product}
                dataKey={product}
                fill={barColors[idx % barColors.length]}
                radius={[4, 4, 0, 0]}
                name={product}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

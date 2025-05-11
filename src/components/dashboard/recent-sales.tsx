"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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
      <div className="w-full bg-white rounded-2xl shadow-sm p-4">
        <Accordion type="single" collapsible className="w-full">
          {salespersons.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No sales data found.
            </div>
          )}
          {salespersons.map((sp, idx) => (
            <AccordionItem key={idx} value={sp.first_name + sp.last_name + idx}>
              <AccordionTrigger>
                <div className="flex flex-col sm:flex-row sm:items-center w-full justify-between gap-2">
                  <span className="font-medium text-base">
                    {sp.first_name} {sp.last_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    Total Sales:{" "}
                    <span className="font-semibold text-primary">
                      {sp.total_sales}
                    </span>
                  </span>
                  <span className="text-sm text-gray-500">
                    Orders:{" "}
                    <span className="font-semibold">{sp.sales_count}</span>
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Product</th>
                        <th className="text-left py-2 px-2">Quantity Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sp.product_sales.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-2 px-2 text-gray-400">
                            No product sales
                          </td>
                        </tr>
                      ) : (
                        sp.product_sales.map((ps, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 px-2">{ps.product_name}</td>
                            <td className="py-2 px-2">{ps.quantity_sold}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

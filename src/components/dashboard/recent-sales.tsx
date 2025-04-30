"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex gap-2 mb-4">
        {(["all", "daily", "weekly", "monthly"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {salespersons.map((sale, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border rounded-lg px-4"
          >
            <div className="flex items-center py-4">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="/placeholder.svg?height=36&width=36"
                  alt={`${sale.first_name} ${sale.last_name}'s Avatar`}
                />
                <AvatarFallback>
                  {sale.first_name.charAt(0)}
                  {sale.last_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1 min-w-0 flex-1">
                <p className="text-sm font-medium leading-none truncate">
                  {sale.first_name} {sale.last_name}
                </p>
              </div>
              <div className="ml-auto font-medium shrink-0 flex flex-col items-end">
                <div>Rs.{sale.total_sales.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {sale.sales_count} sales
                </div>
              </div>
              <AccordionTrigger className="ml-4" />
            </div>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 text-sm pb-4">
                {sale.product_sales.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-muted/50 rounded"
                  >
                    <span className="truncate">{product.product_name}</span>
                    <span className="font-medium ml-2">
                      {product.quantity_sold}
                    </span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

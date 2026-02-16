"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_amount: number;
}

export function TopProducts({ id }: { id?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `https://zone-kind-centuries-finding.trycloudflare.com/api/sales/top-products/?filter=${timeRange} ${id ? `&franchise=${id}` : ""
          }`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        setProducts(result.products || []);
      } catch (error) {
        console.error("Error fetching top products:", error);
        setProducts([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [timeRange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs
          defaultValue="weekly"
          onValueChange={(value) => setTimeRange(value as "weekly" | "monthly")}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border overflow-x-auto min-w-0">
        {isLoading ? (
          // Loading skeleton for 5 items
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row justify-between p-2 sm:p-4 border-b last:border-b-0 gap-2"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-[140px] sm:w-[200px]" />
                <Skeleton className="h-3 w-[100px] sm:w-[150px]" />
              </div>
              <Skeleton className="h-4 w-[80px] sm:w-[100px]" />
            </div>
          ))
        ) : (
          <>
            {(products || []).map((product) => (
              <div
                key={product.product_id}
                className="flex flex-col sm:flex-row justify-between p-2 sm:p-4 border-b last:border-b-0 gap-2"
              >
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {product.product_name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Quantity Sold: {product.total_quantity}
                  </p>
                </div>
                <div className="font-bold text-sm sm:text-base">
                  Rs. {product.total_amount.toFixed(2)}
                </div>
              </div>
            ))}
            {(products || []).length === 0 && (
              <div className="p-2 sm:p-4 text-center text-xs sm:text-base text-muted-foreground">
                No products found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

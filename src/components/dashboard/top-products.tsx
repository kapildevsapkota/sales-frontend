"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_amount: number;
}

export function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `https://sales.baliyoventures.com/api/sales/top-products/?filter=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();
        setProducts(result.data);
      } catch (error) {
        console.error("Error fetching top products:", error);
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
        >
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          // Loading skeleton for 5 items
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex justify-between p-4 border-b last:border-b-0"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-4 w-[100px]" />
            </div>
          ))
        ) : (
          <>
            {products.map((product) => (
              <div
                key={product.product_id}
                className="flex justify-between p-4 border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium">{product.product_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity Sold: {product.total_quantity}
                  </p>
                </div>
                <div className="font-bold">
                  Rs. {product.total_amount.toFixed(2)}
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No products found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

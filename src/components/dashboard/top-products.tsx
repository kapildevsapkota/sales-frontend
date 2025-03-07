"use client";

import { Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function TopProducts() {
  return (
    <div className="space-y-8">
      {[
        {
          name: "Wireless Earbuds Pro",
          price: "$129.99",
          percentage: 32,
          units: "1,245 units",
          percentageText: "32% of total sales",
        },
        {
          name: "Smart Watch Series 5",
          price: "$249.99",
          percentage: 28,
          units: "982 units",
          percentageText: "28% of total sales",
        },
        {
          name: 'Laptop Pro 16"',
          price: "$1,899.99",
          percentage: 21,
          units: "645 units",
          percentageText: "21% of total sales",
        },
        {
          name: "Smartphone Ultra",
          price: "$899.99",
          percentage: 15,
          units: "432 units",
          percentageText: "15% of total sales",
        },
      ].map((product, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center">
            <div className="mr-2 rounded-md bg-primary/10 p-1">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium leading-none truncate">
                  {product.name}
                </p>
                <p className="text-sm font-medium shrink-0">{product.price}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>{product.percentageText}</p>
                <p className="shrink-0">{product.units}</p>
              </div>
            </div>
          </div>
          <Progress value={product.percentage} className="h-2" />
        </div>
      ))}
    </div>
  );
}

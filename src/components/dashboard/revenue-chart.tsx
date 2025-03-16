"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Define the interface for the product data
interface Product {
  color: string | undefined;
  product_name: string;
  revenue: number;
  percentage: number; // Include percentage if needed
}

export function RevenueChart() {
  const [data, setData] = useState<Product[]>([]); // State to hold revenue data

  useEffect(() => {
    const fetchRevenueData = async () => {
      const token = localStorage.getItem("accessToken"); // Get the access token from local storage
      const response = await fetch(
        "https://sales.baliyoventures.com/api/sales/revenue-by-product/",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the authorization header
          },
        }
      );
      const result = await response.json();
      const chartData = result.products.map((product: Product) => ({
        name: product.product_name,
        value: product.revenue,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Generate a random color for each product
      }));
      setData(chartData); // Update state with fetched revenue data
    };

    fetchRevenueData();
  }, []);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Product
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].name}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Revenue
                        </span>
                        <span className="font-bold">
                          $
                          {typeof payload[0].value === "number"
                            ? payload[0].value.toFixed(2)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

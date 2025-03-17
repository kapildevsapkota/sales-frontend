"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the type for a salesperson
interface Salesperson {
  first_name: string;
  last_name: string;
  phone_number: string;
  franchise: string;
  total_sales: number;
  sales_count: number;
}

export function RecentSales() {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]); // Use the Salesperson type

  useEffect(() => {
    const fetchSalespersons = async () => {
      const token = localStorage.getItem("accessToken"); // Get the access token from local storage
      const response = await fetch(
        "https://sales.baliyoventures.com/api/sales/top-salespersons/",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the authorization header
          },
        }
      );
      const data: Salesperson[] = await response.json(); // Specify the type of data
      setSalespersons(data); // Update state with fetched data
    };

    fetchSalespersons();
  }, []);

  return (
    <div className="space-y-8">
      {salespersons.map((sale, index) => (
        <div key={index} className="flex items-center">
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
            <p className="text-sm text-muted-foreground truncate">
              {sale.phone_number}
            </p>
          </div>
          <div className="ml-auto font-medium shrink-0">
            Rs.{sale.total_sales.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

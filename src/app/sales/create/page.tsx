"use client";

import { useEffect, useState } from "react";
import CreateOrderForm from "@/components/forms/create-order-form";
import { Product } from "@/types/product";
import TabBar from "@/components/layout/badgebar";
import { Toaster } from "sonner";

export default function CreateOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          throw new Error("No access token found");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/sales/products`,
          {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      }
    }

    fetchProducts();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-6 sm:py-1 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/** <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Create New Order
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Complete the form below to create a new order
          </p>
        </div>**/}
        <div className="py-5">
          <TabBar />
        </div>

        <div className="overflow-hidden">
          <div className="p-4 sm:p-6">
            <CreateOrderForm
              products={products}
              oilTypes={["Mustard Oil", "Olive Oil", "Coconut Oil"]}
              convincedByOptions={["Friend", "Advertisement", "Social Media"]}
            />
          </div>
        </div>
      </div>
      <Toaster richColors closeButton />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Product {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_amount: number;
}

export function TopProducts() {
  const [products, setProducts] = useState<Product[]>([]); // State to hold product data

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("accessToken"); // Get the access token from local storage
      const response = await fetch(
        "https://sales.baliyoventures.com/api/sales/top-products/",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the authorization header
          },
        }
      );
      const result = await response.json();
      console.log("top products", result);
      setProducts(result.data); // Update state with fetched product data
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Top Products</h2>
      {products.map((product) => (
        <div
          key={product.product_id}
          className="flex justify-between p-4 border-b"
        >
          <div>
            <p className="font-medium">{product.product_name}</p>
            <p className="text-sm text-muted-foreground">
              Quantity Sold: {product.total_quantity}
            </p>
          </div>
          <div className="font-bold">Rs. {product.total_amount.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

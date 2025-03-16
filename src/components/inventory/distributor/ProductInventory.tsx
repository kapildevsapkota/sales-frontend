"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Package,
  Plus,
  Search,
} from "lucide-react";
import AddProduct from "@/components/inventory/distributor/addProduct";

// Define the interface for inventory items
interface InventoryItem {
  id: number;
  product: string;
  product_id: number;
  quantity: number;
  status: string;
}

// Define the shape of the API response
interface DistributorInventory {
  [key: string]: { inventory: InventoryItem[] };
}

// SWR fetcher function
const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }).then((res) => res.json());

const ProductInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(
    null
  );
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Use SWR to fetch data
  const { data, error } = useSWR<DistributorInventory>(
    "https://sales.baliyoventures.com/api/sales/distributor-inventory/",
    fetcher
  );

  // Filter products based on search term and status filter
  const filterProducts = (products: InventoryItem[]) => {
    return products.filter((product) => {
      const matchesSearch = product.product
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter
        ? product.status === statusFilter
        : true;
      return matchesSearch && matchesStatus;
    });
  };

  // Function to handle saving edited product quantity
  const handleSaveEdit = async (product: InventoryItem) => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `https://sales.baliyoventures.com/api/sales/inventory/${product.id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          new_quantity: product.quantity,
        }),
      }
    );

    if (response.ok) {
      // Revalidate the data to reflect changes immediately
      mutate(
        "https://sales.baliyoventures.com/api/sales/distributor-inventory/"
      );
      setEditingProduct(null); // Close the editing modal
    }
  };

  // Function to handle edit button click
  const handleEditClick = (product: InventoryItem) => {
    setEditingProduct(product);
  };

  // Function to handle opening the AddProduct dialog
  const handleAddProductClick = () => {
    setIsAddProductOpen(true);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Distributor Inventory</CardTitle>
              <CardDescription>
                Manage your product inventory across distributors
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                onClick={handleAddProductClick}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by product name..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <button
                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
                onClick={() =>
                  setStatusFilter(statusFilter ? null : "ready_to_dispatch")
                }
              >
                <span>Filter by Status</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
              {statusFilter && (
                <div className="absolute right-0 top-11 z-10 w-[180px] rounded-md border bg-popover text-popover-foreground shadow-md">
                  <div
                    className="flex cursor-pointer items-center justify-between py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setStatusFilter(null)}
                  >
                    <span>All</span>
                    {!statusFilter && <Check className="h-4 w-4" />}
                  </div>
                  <div
                    className="flex cursor-pointer items-center justify-between py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setStatusFilter("ready_to_dispatch")}
                  >
                    <span>Ready to Dispatch</span>
                    {statusFilter === "ready_to_dispatch" && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className="flex cursor-pointer items-center justify-between py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setStatusFilter("incoming")}
                  >
                    <span>Incoming</span>
                    {statusFilter === "incoming" && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {Object.entries(data).map(([distributorName, distributorData]) => (
            <div key={distributorName} className="mb-8">
              <h2 className="text-lg font-semibold mb-4">{distributorName}</h2>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 bg-muted py-3 px-4 text-sm font-medium">
                  <div className="col-span-4 flex items-center">
                    <span>Product Name</span>
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                  <div className="col-span-2">Product ID</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y">
                  {filterProducts(distributorData.inventory).map((product) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-12 items-center py-3 px-4"
                    >
                      <div className="col-span-4 flex items-center">
                        <Package className="mr-2 h-4 w-4 text-purple-600" />
                        <span>{product.product}</span>
                      </div>
                      <div className="col-span-2">{product.product_id}</div>
                      <div className="col-span-2 text-center">
                        {product.quantity}
                      </div>
                      <div className="col-span-2 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            product.status === "ready_to_dispatch"
                              ? "bg-green-100 text-green-800"
                              : product.status === "incoming"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.status === "incoming" && (
                            <AlertCircle className="mr-1 h-3 w-3" />
                          )}
                          {product.status.charAt(0).toUpperCase() +
                            product.status.slice(1)}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                            onClick={() => handleEditClick(product)}
                          >
                            <span className="sr-only">Edit</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                              <path d="m15 5 4 4"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Edit Product
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit(editingProduct);
              }}
            >
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingProduct.product}
                  readOnly
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingProduct.quantity}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="p-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="p-2 bg-black text-white rounded-md hover:bg-black transition duration-200"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render AddProduct component when the dialog is open */}
      {isAddProductOpen && (
        <AddProduct onClose={() => setIsAddProductOpen(false)} />
      )}
    </div>
  );
};

export default ProductInventory;

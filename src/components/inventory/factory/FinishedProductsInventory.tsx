"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";

import {
  AlertCircle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import AddProduct from "@/components/inventory/factory/addProduct";

// Define types for the API response
type Product = {
  id: number;
  name: string;
  description: string;
};

type InventoryItem = {
  id: number;
  product_id: number;
  product: Product | string; // Handle both old and new response formats if needed
  quantity: number;
  status: string;
  allocated?: number;
  available?: number;
};

type FactoryInventory = {
  factory: string;
  inventory: InventoryItem[];
};

type ApiResponse = FactoryInventory;

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }).then((res) => res.json());

const FinishedProductsInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(
    null
  );
  const [updatingQuantityProduct, setUpdatingQuantityProduct] = useState<InventoryItem | null>(null);
  const [addQuantity, setAddQuantity] = useState<number | "">("");

  const { data, error } = useSWR<ApiResponse>(
    "https://zone-kind-centuries-finding.trycloudflare.com/api/sales/factory-inventory/?status=ready_to_dispatch",
    fetcher
  );

  const products = data?.inventory || [];

  const determineStatus = (
    quantity: number
  ): "optimal" | "low" | "critical" => {
    if (quantity > 500) return "optimal";
    if (quantity > 200) return "low";
    return "critical";
  };

  const filteredProducts = products.filter((product) => {
    const productName = typeof product.product === "string" ? product.product : product.product.name;
    const displayStatus = determineStatus(product.quantity);
    const matchesSearch = productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? displayStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleProductAdded = (newProduct: InventoryItem) => {
    mutate("https://zone-kind-centuries-finding.trycloudflare.com/api/sales/factory-inventory/?status=ready_to_dispatch");
    setIsAddingProduct(false);
  };

  const handleSaveEdit = async (product: InventoryItem) => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `https://zone-kind-centuries-finding.trycloudflare.com/api/sales/inventory/${product.id}/`,
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
      mutate("https://zone-kind-centuries-finding.trycloudflare.com/api/sales/factory-inventory/?status=ready_to_dispatch");
      setEditingProduct(null);
    }
  };

  const handleEditClick = (product: InventoryItem) => {
    setEditingProduct(product);
  };

  const handleUpdateQuantity = async () => {
    if (!updatingQuantityProduct) return;

    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(
      `https://zone-kind-centuries-finding.trycloudflare.com/api/sales/inventory/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product_id: updatingQuantityProduct.product_id,
          quantity: Number(addQuantity) || 0,
        }),
      }
    );

    if (response.ok) {
      // Revalidate the data to reflect changes immediately
      mutate(
        "https://zone-kind-centuries-finding.trycloudflare.com/api/sales/factory-inventory/?status=ready_to_dispatch"
      );

      // Reset state and close modal
      setUpdatingQuantityProduct(null);
      setAddQuantity("");
    }
  };

  return (
    <div className="space-y-6 py-4 md:pl-4 rounded-md h-full w-full">
      <div>
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Finished Products Inventory</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Manage your finished hair oil products
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mb-3"
                onClick={() => setIsAddingProduct(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by product name..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full"
              onClick={() => setStatusFilter(statusFilter ? null : "low")}
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
                  onClick={() => setStatusFilter("optimal")}
                >
                  <span>Optimal</span>
                  {statusFilter === "optimal" && <Check className="h-4 w-4" />}
                </div>
                <div
                  className="flex cursor-pointer items-center justify-between py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setStatusFilter("low")}
                >
                  <span>Low Stock</span>
                  {statusFilter === "low" && <Check className="h-4 w-4" />}
                </div>
                <div
                  className="flex cursor-pointer items-center justify-between py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setStatusFilter("critical")}
                >
                  <span>Critical</span>
                  {statusFilter === "critical" && <Check className="h-4 w-4" />}
                </div>
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="rounded-md bg-red-50 p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading data
                </h3>
                <div className="mt-2 text-sm text-red-700">{error.message}</div>
              </div>
            </div>
          </div>
        ) : !data ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            {/* Header: visible only on larger screens */}
            <div className="hidden sm:grid grid-cols-10 bg-muted py-3 px-4 text-sm font-medium">
              <div className="col-span-4 flex items-center">
                <span>Product Name</span>
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
              <div className="col-span-2 text-center">Available</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const displayStatus = determineStatus(product.quantity);
                  return (
                    <div
                      key={product.id}
                      className="bg-white"
                    >
                      {/* Mobile View */}
                      <div className="sm:hidden p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center font-bold text-base">
                            <Package className="mr-2 h-4 w-4 text-purple-600 shrink-0" />
                            <span>{typeof product.product === "string" ? product.product : product.product.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
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
                            <button
                              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                              onClick={() => setUpdatingQuantityProduct(product)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Available</p>
                            <p className="font-semibold text-sm">{product.available || product.quantity}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                            <div>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${displayStatus === "optimal"
                                  ? "bg-green-100 text-green-800"
                                  : displayStatus === "low"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {displayStatus !== "optimal" && (
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                )}
                                {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden sm:grid sm:grid-cols-10 sm:items-center py-3 px-4 text-sm">
                        <div className="col-span-4 flex items-center">
                          <Package className="mr-2 h-4 w-4 text-purple-600" />
                          <span>{typeof product.product === "string" ? product.product : product.product.name}</span>
                        </div>
                        <div className="col-span-2 text-center">
                          {product.available || product.quantity}
                        </div>
                        <div className="col-span-2 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${displayStatus === "optimal"
                              ? "bg-green-100 text-green-800"
                              : displayStatus === "low"
                                ? "bg-yellow-101 text-yellow-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {displayStatus !== "optimal" && (
                              <AlertCircle className="mr-1 h-3 w-3" />
                            )}
                            {displayStatus.charAt(0).toUpperCase() +
                              displayStatus.slice(1)}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <div className="flex justify-end gap-2">
                            <button
                              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
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
                            <button
                              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                              onClick={() => setUpdatingQuantityProduct(product)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No products found. Try adjusting your search or filters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {
        isAddingProduct && (
          <AddProduct
            onClose={() => setIsAddingProduct(false)}
            onProductAdded={handleProductAdded}
          />
        )
      }

      {
        editingProduct && (
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
                    value={typeof editingProduct.product === "string" ? editingProduct.product : editingProduct.product.name}
                    readOnly
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Quantity
                  </label>
                  <Input
                    type="number"
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
        )
      }

      {
        updatingQuantityProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Update {typeof updatingQuantityProduct.product === "string" ? updatingQuantityProduct.product : updatingQuantityProduct.product.name}
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Add Quantity
                </label>
                <Input
                  type="number"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                  placeholder="Enter quantity to add"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="p-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200"
                  onClick={() => {
                    setUpdatingQuantityProduct(null);
                    setAddQuantity("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="p-2 bg-black text-white rounded-md hover:bg-black transition duration-200"
                  onClick={handleUpdateQuantity}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default FinishedProductsInventory;

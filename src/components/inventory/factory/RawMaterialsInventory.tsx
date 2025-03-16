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
  ArrowUpDown,
  Check,
  ChevronDown,
  Leaf,
  Plus,
  Search,
  AlertCircle,
} from "lucide-react";
import AddProduct from "@/components/inventory/factory/addMaterial";

// Define types for the raw material data
type Product = {
  id: number;
  name: string;
  description: string;
  image: string | null;
};

type RawMaterial = {
  id: number;
  product: Product;
  quantity: number;
  status: string;
};

// New type for adding a new material
type NewMaterial = {
  product_name: string;
  product_description: string;
  quantity: number;
};

type ApiResponse = {
  count: number;
  results: RawMaterial[];
};

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  }).then((res) => res.json());

const RawMaterialsInventory = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(
    null
  );
  const [isAddingMaterial, setIsAddingMaterial] = useState<boolean>(false);
  const [newMaterial, setNewMaterial] = useState<NewMaterial>({
    product_name: "",
    product_description: "",
    quantity: 0,
  });
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  // Use SWR to fetch data
  const { data, error } = useSWR<ApiResponse>(
    "https://sales.baliyoventures.com/api/sales/raw-materials/",
    fetcher
  );

  const materials = data?.results || [];

  // Handle edit button click
  const handleEditClick = (material: RawMaterial) => {
    setEditingMaterial(material);
  };

  // Handle saving edited material - now using PATCH method
  const handleSaveEdit = async (updatedMaterial: RawMaterial) => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `https://sales.baliyoventures.com/api/sales/inventory/${updatedMaterial.id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          new_quantity: updatedMaterial.quantity,
        }),
      }
    );

    if (response.ok) {
      // Revalidate the data to reflect changes immediately
      mutate("https://sales.baliyoventures.com/api/sales/raw-materials/");
      setEditingMaterial(null);
    }
  };

  // Handle adding a new material
  const handleAddMaterial = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      "https://sales.baliyoventures.com/api/sales/inventory/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product_id: newMaterial.product_name,
          quantity: newMaterial.quantity,
        }),
      }
    );

    if (response.ok) {
      // Revalidate the data to reflect changes immediately
      mutate("https://sales.baliyoventures.com/api/sales/raw-materials/");

      // Reset the form and close it
      setNewMaterial({
        product_name: "",
        product_description: "",
        quantity: 0,
      });
      setIsAddingMaterial(false);
    }
  };

  // Filter materials based on search term and status filter
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter
      ? material.status === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Raw Materials Inventory</CardTitle>
              <CardDescription>
                Manage your raw materials for hair oil production
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                onClick={() => setIsAddingProduct(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Material
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
                placeholder="Search materials..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <button
                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
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
                    {statusFilter === "optimal" && (
                      <Check className="h-4 w-4" />
                    )}
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
                    {statusFilter === "critical" && (
                      <Check className="h-4 w-4" />
                    )}
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
                  <div className="mt-2 text-sm text-red-700">
                    {error.message}
                  </div>
                </div>
              </div>
            </div>
          ) : !data ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-8 bg-muted py-3 px-4 text-sm font-medium">
                <div className="col-span-5 flex items-center">
                  <span>Material Name</span>
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y">
                {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="grid grid-cols-8 items-center py-3 px-4"
                  >
                    <div className="col-span-5 flex items-center">
                      <Leaf className="mr-2 h-4 w-4 text-green-600" />
                      <div contentEditable={false}>{material.product.name}</div>
                    </div>
                    <div className="col-span-2 text-center">
                      {material.quantity}
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                        onClick={() => handleEditClick(material)}
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
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Material Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Edit Material
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit(editingMaterial);
              }}
            >
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingMaterial.product.name}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      product: {
                        ...editingMaterial.product,
                        name: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter material name"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingMaterial.quantity}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
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
                  onClick={() => setEditingMaterial(null)}
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

      {/* Add Material Modal */}
      {isAddingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Add New Material
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddMaterial();
              }}
            >
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMaterial.product_name}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      product_name: e.target.value,
                    })
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Product Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMaterial.product_description}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      product_description: e.target.value,
                    })
                  }
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMaterial.quantity}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter quantity"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="p-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200"
                  onClick={() => setIsAddingMaterial(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="p-2 bg-black text-white rounded-md hover:bg-black transition duration-200"
                >
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Dialog */}
      {isAddingProduct && (
        <AddProduct onClose={() => setIsAddingProduct(false)} />
      )}
    </div>
  );
};

export default RawMaterialsInventory;

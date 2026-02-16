"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
    ArrowUpDown,
    Check,
    ChevronDown,
    Container,
    Plus,
    Search,
    AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import AddProduct from "@/components/inventory/factory/addMaterial";

// Define types for the data
type Product = {
    id: number;
    name: string;
    description: string;
    image: string | null;
};

type InventoryItem = {
    id: number;
    product_id: number;
    product: Product | string;
    quantity: number;
    status: string;
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

const BottleCaseInventory = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
    const [updatingQuantityItem, setUpdatingQuantityItem] = useState<InventoryItem | null>(null);
    const [addQuantity, setAddQuantity] = useState<number | "">("");

    const determineStatus = (
        quantity: number
    ): "optimal" | "low" | "critical" => {
        if (quantity > 500) return "optimal";
        if (quantity > 200) return "low";
        return "critical";
    };

    // Use SWR to fetch data
    const { data, error } = useSWR<ApiResponse>(
        "https://zone-kind-centuries-finding.trycloudflare.com/api/sales/factory-inventory/?status=bottles",
        fetcher
    );

    const items = data?.inventory || [];

    // Handle edit button click
    const handleEditClick = (item: InventoryItem) => {
        setEditingItem(item);
    };

    // Handle saving edited item
    const handleSaveEdit = async (updatedItem: InventoryItem) => {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(
            `https://zone-kind-centuries-finding.trycloudflare.com/api/sales/inventory/${updatedItem.id}/`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    new_quantity: updatedItem.quantity,
                }),
            }
        );

        if (response.ok) {
            mutate("https://zone-kind-centuries-finding.trycloudflare.com/api/sales/factory-inventory/?status=bottles");
            setEditingItem(null);
        }
    };

    const handleUpdateQuantity = async () => {
        if (!updatingQuantityItem) return;

        const accessToken = localStorage.getItem("accessToken");
        const productId = updatingQuantityItem.product_id;

        const response = await fetch(
            `https://zone-kind-centuries-finding.trycloudflare.com/api/sales/inventory/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: Number(addQuantity) || 0,
                }),
            }
        );

        if (response.ok) {
            mutate("https://zone-kind-centuries-finding.trycloudflare.com/api/sales/factory-inventory/?status=bottles");
            setUpdatingQuantityItem(null);
            setAddQuantity("");
        }
    };

    // Filter items based on search term and status filter
    const filteredItems = items.filter((item) => {
        const productName = typeof item.product === "string" ? item.product : item.product?.name;
        const matchesSearch = productName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const displayStatus = determineStatus(item.quantity);

        const matchesStatus = statusFilter
            ? displayStatus === statusFilter
            : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 py-4 md:pl-4 rounded-md h-full w-full">
            <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="mb-3">
                        <h2 className="text-xl font-bold">Bottle Case Inventory</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage your bottle cases for production
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mb-3"
                            onClick={() => setIsAddingProduct(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Bottle Case
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search bottle cases..."
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
                        {/* Header */}
                        <div className="hidden sm:grid grid-cols-10 bg-muted py-3 px-4 text-sm font-medium">
                            <div className="col-span-4 flex items-center">
                                <span>Bottle Case Name</span>
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-center">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white"
                                >
                                    {/* Mobile View */}
                                    <div className="sm:hidden p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center font-bold text-base">
                                                <Container className="mr-2 h-4 w-4 text-blue-600 shrink-0" />
                                                <span>{typeof item.product === "string" ? item.product : item.product?.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                                                    onClick={() => handleEditClick(item)}
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
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                                                    onClick={() => setUpdatingQuantityItem(item)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quantity</p>
                                                <p className="font-semibold text-sm">{item.quantity}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                                                <div>
                                                    {(() => {
                                                        const displayStatus = determineStatus(item.quantity);
                                                        return (
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
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop View */}
                                    <div className="hidden sm:grid sm:grid-cols-10 sm:items-center py-3 px-4 text-sm">
                                        {/* Item Name */}
                                        <div className="sm:col-span-4 flex items-center">
                                            <Container className="mr-2 h-4 w-4 text-blue-600" />
                                            <div>{typeof item.product === "string" ? item.product : item.product?.name}</div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="sm:col-span-2 text-center">
                                            {item.quantity}
                                        </div>

                                        {/* Status */}
                                        <div className="sm:col-span-2 text-center">
                                            {(() => {
                                                const displayStatus = determineStatus(item.quantity);
                                                return (
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
                                                        {displayStatus.charAt(0).toUpperCase() +
                                                            displayStatus.slice(1)}
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        {/* Actions */}
                                        <div className="sm:col-span-2">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                                                    onClick={() => handleEditClick(item)}
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
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                                                    onClick={() => setUpdatingQuantityItem(item)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="py-8 text-center text-gray-500">
                                    No bottle cases found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                            Edit Bottle Case
                        </h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveEdit(editingItem);
                            }}
                        >
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <Input
                                    type="text"
                                    value={typeof editingItem.product === "string" ? editingItem.product : editingItem.product?.name}
                                    readOnly
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">
                                    Quantity
                                </label>
                                <Input
                                    type="number"
                                    value={editingItem.quantity}
                                    onChange={(e) =>
                                        setEditingItem({
                                            ...editingItem,
                                            quantity: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    placeholder="Enter quantity"
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    className="p-2 bg-gray-300 rounded-md hover:bg-gray-400 transition duration-200"
                                    onClick={() => setEditingItem(null)}
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

            {/* Add Product Dialog */}
            {isAddingProduct && (
                <AddProduct onClose={() => setIsAddingProduct(false)} status="bottles" />
            )}

            {updatingQuantityItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                            Update {typeof updatingQuantityItem.product === "string" ? updatingQuantityItem.product : updatingQuantityItem.product?.name}
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
                                    setUpdatingQuantityItem(null);
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
            )}
        </div>
    );
};

export default BottleCaseInventory;

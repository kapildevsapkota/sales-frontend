"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { Package, Search, Plus, Trash2, Send, Check, ChevronDown, AlertCircle, History, User, Calendar, MapPin, XCircle, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import DispatchHistoryDialog from "./DispatchHistoryDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";
type Product = {
    id: number;
    name: string;
};

type InventoryItem = {
    id: number;
    product_id: number;
    product: Product | string;
    quantity: number;
    available?: number;
};

type Franchise = {
    id: number;
    name: string;
};

type RequestItem = {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
};

type UserInfo = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
    franchise: string;
    factory: string;
    address: string;
};

type InventoryRequest = {
    id: number;
    user: UserInfo;
    request_items: RequestItem[];
    factory: number;
    franchise: number;
    franchise_name: string;
    status: "Pending" | "Accepted" | "Rejected";
    total_amount: string;
    created_at: string;
};

const fetcher = (url: string) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }).then((res) => res.json());

type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export default function DispatchManagement() {
    const [selectedFranchise, setSelectedFranchise] = useState<number | null>(null);
    const [dispatchItems, setDispatchItems] = useState<{ product_id: number; quantity: number; name: string; max: number }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { data: inventoryData } = useSWR<{ inventory: InventoryItem[] }>(
        "https://sales.baliyoventures.com/api/sales/factory-inventory/?status=ready_to_dispatch",
        fetcher
    );

    const { data: franchiseData } = useSWR<Franchise[] | { results: Franchise[] }>(
        "https://sales.baliyoventures.com/api/account/my-franchises",
        fetcher
    );

    const { data: requestsData, mutate: mutateRequests } = useSWR<PaginatedResponse<InventoryRequest>>(
        `https://sales.baliyoventures.com/api/sales/inventory-request/?page=${page}`,
        fetcher
    );

    const franchises = Array.isArray(franchiseData) ? franchiseData : (franchiseData?.results || []);
    const inventory = inventoryData?.inventory || [];
    const requests = requestsData?.results || [];

    const filteredInventory = inventory.filter((item) => {
        const name = typeof item.product === "string" ? item.product : item.product.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleQuantityChange = (item: InventoryItem, quantity: number) => {
        const productName = typeof item.product === "string" ? item.product : item.product.name;

        setDispatchItems(prev => {
            if (quantity <= 0) {
                return prev.filter(di => di.product_id !== item.product_id);
            }

            const exists = prev.find(di => di.product_id === item.product_id);
            if (exists) {
                return prev.map(di =>
                    di.product_id === item.product_id
                        ? { ...di, quantity: Math.min(quantity, di.max) }
                        : di
                );
            } else {
                return [
                    ...prev,
                    {
                        product_id: item.product_id,
                        quantity: Math.min(quantity, item.available || item.quantity),
                        name: productName,
                        max: item.available || item.quantity
                    }
                ];
            }
        });
    };

    const handleDispatch = () => {
        if (!selectedFranchise) {
            toast.error("Please select a franchise");
            return;
        }

        if (dispatchItems.length === 0) {
            toast.error("Please add at least one item to dispatch");
            return;
        }

        setIsConfirmOpen(true);
    };

    const confirmDispatch = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.post("/api/sales/inventory-request/", {
                franchise: selectedFranchise,
                request_items: dispatchItems.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
            });

            if (response.status === 201 || response.status === 200) {
                toast.success("Dispatch request created successfully");
                setDispatchItems([]);
                setSelectedFranchise(null);
                setIsConfirmOpen(false);
                mutateRequests();
            }
        } catch (error) {
            console.error("Dispatch error:", error);
            toast.error("Failed to create dispatch request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStockStatus = (quantity: number) => {
        if (quantity > 20) return { label: "In Stock", class: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" };
        if (quantity > 5) return { label: "Low Stock", class: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800" };
        return { label: "Critically Low", class: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800" };
    };

    const totalSelectedUnits = dispatchItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="max-w-7xl w-full mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900  gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <Link href="/super-admin/inventory" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>

                        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">Dispatch Management</h1>
                    </div>
                    <div className="relative w-full md:w-64">
                        <select
                            className="w-full pl-3 pr-10 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
                            value={selectedFranchise || ""}
                            onChange={(e) => setSelectedFranchise(Number(e.target.value))}
                        >
                            <option value="">Select Franchise</option>
                            {franchises.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4" />
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                            placeholder="Search inventory..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <DispatchHistoryDialog />
                </div>
            </header>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Inventory Table Section */}
                <section className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white dark:bg-slate-900  ">
                                    <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="py-4 px-4 min-w-[200px]">Item Name</th>
                                        <th className="py-4 px-4">Stock Status</th>
                                        <th className="py-4 px-4 text-center">Available Quantity</th>
                                        <th className="py-4 px-6 text-right w-48">To Dispatch</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {filteredInventory.length > 0 ? (
                                        filteredInventory.map((item) => {
                                            const productName = typeof item.product === "string" ? item.product : item.product.name;
                                            const isSelected = dispatchItems.some(di => di.product_id === item.product_id);
                                            const status = getStockStatus(item.available || item.quantity);
                                            const dispatchItem = dispatchItems.find(di => di.product_id === item.product_id);

                                            return (
                                                <tr key={item.id} className={cn(
                                                    "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group",
                                                    isSelected && "bg-blue-50/30 dark:bg-blue-900/10"
                                                )}>
                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{productName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={cn(
                                                            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border",
                                                            status.class
                                                        )}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                                        {item.available || item.quantity}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <input
                                                            className={cn(
                                                                "w-32 ml-auto px-3 py-1.5 text-sm text-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all",
                                                                isSelected ? "border-blue-500" : "border-slate-200"
                                                            )}
                                                            placeholder="0"
                                                            type="number"
                                                            value={dispatchItem?.quantity || ""}
                                                            onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 0)}
                                                            min={0}
                                                            max={item.available || item.quantity}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">No items available to dispatch</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden p-4 space-y-4">
                            {filteredInventory.length > 0 ? (
                                filteredInventory.map((item) => {
                                    const productName = typeof item.product === "string" ? item.product : item.product.name;
                                    const isSelected = dispatchItems.some(di => di.product_id === item.product_id);
                                    const status = getStockStatus(item.available || item.quantity);
                                    const dispatchItem = dispatchItems.find(di => di.product_id === item.product_id);

                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all flex flex-col gap-3",
                                                isSelected
                                                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                                                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                                            )}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                        {productName}
                                                    </span>
                                                    <span className={cn(
                                                        "inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border",
                                                        status.class
                                                    )}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available</span>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {item.available || item.quantity}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50">
                                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty to Dispatch</span>
                                                <input
                                                    className={cn(
                                                        "w-28 px-3 py-2 text-sm text-right bg-white dark:bg-slate-700 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold",
                                                        isSelected ? "border-blue-500 shadow-sm" : "border-slate-200 dark:border-slate-600"
                                                    )}
                                                    placeholder="0"
                                                    type="number"
                                                    value={dispatchItem?.quantity || ""}
                                                    onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 0)}
                                                    min={0}
                                                    max={item.available || item.quantity}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center text-slate-400 italic">No items available to dispatch</div>
                            )}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="px-4 sm:px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-4">
                            <div className="flex flex-col gap-1.5 text-left w-full sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Target Franchise</span>
                                </div>

                                {!selectedFranchise ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg w-fit">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">Please select a franchise</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg w-fit">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm capitalize font-bold text-blue-700 dark:text-blue-300">
                                            {franchises.find(f => f.id === selectedFranchise)?.name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                {dispatchItems.length > 0 && (
                                    <div className="hidden sm:flex flex-col items-end mr-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Selection</span>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{dispatchItems.length} Items • {totalSelectedUnits} Units</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleDispatch}
                                    disabled={isSubmitting || dispatchItems.length === 0 || !selectedFranchise}
                                    className={cn(
                                        "w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg",
                                        (isSubmitting || dispatchItems.length === 0 || !selectedFranchise)
                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none border border-slate-200 dark:border-slate-700"
                                            : "bg-blue-800 hover:bg-blue-700 text-white shadow-blue-900/20 hover:shadow-blue-900/30"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Submit Dispatch
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Dispatch</DialogTitle>
                        <DialogDescription>
                            Review the items selected for dispatch to <span className="font-bold text-slate-900">{franchises.find(f => f.id === selectedFranchise)?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[300px] overflow-auto py-4">
                        <div className="space-y-3">
                            {dispatchItems.map((item) => (
                                <div key={item.product_id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">{item.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Quantity</span>
                                    </div>
                                    <span className="text-base font-bold text-blue-600">{item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="py-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-500">Total Selection</span>
                        <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 block">{dispatchItems.length} Products</span>
                            <span className="text-xs font-medium text-slate-400">{totalSelectedUnits} Units Total</span>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-blue-800 hover:bg-blue-700 text-white font-bold"
                            onClick={confirmDispatch}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                "Confirm Dispatch"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


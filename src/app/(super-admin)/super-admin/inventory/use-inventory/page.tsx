"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Save, Package, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// Types
type Product = {
    id: number;
    name: string;
    description: string;
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

const fetcher = (url: string) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    });

export default function UseInventoryPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItems, setSelectedItems] = useState<{ [id: number]: { quantity: number; name: string; available: number } }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: rawMaterials, error: rawError, isLoading: rawLoading, mutate: mutateRaw } = useSWR<FactoryInventory>(
        "https://sales.baliyoventures.com/api/sales/factory-inventory/?status=raw_material",
        fetcher
    );
    const { data: bottles, error: bottlesError, isLoading: bottlesLoading, mutate: mutateBottles } = useSWR<FactoryInventory>(
        "https://sales.baliyoventures.com/api/sales/factory-inventory/?status=bottles",
        fetcher
    );
    const { data: stickers, error: stickersError, isLoading: stickersLoading, mutate: mutateStickers } = useSWR<FactoryInventory>(
        "https://sales.baliyoventures.com/api/sales/factory-inventory/?status=stickers",
        fetcher
    );

    const allItems = useMemo(() => {
        const combined: (InventoryItem & { category: string })[] = [];

        rawMaterials?.inventory.forEach(i => combined.push({ ...i, category: "Raw Material" }));
        bottles?.inventory.forEach(i => combined.push({ ...i, category: "Bottles" }));
        stickers?.inventory.forEach(i => combined.push({ ...i, category: "Stickers" }));

        return combined;
    }, [rawMaterials, bottles, stickers]);

    const filteredItems = allItems.filter(item => {
        const name = typeof item.product === "string" ? item.product : item.product.name;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleQuantityChange = (item: InventoryItem, quantity: number) => {
        const itemName = typeof item.product === "string" ? item.product : item.product.name;

        setSelectedItems(prev => {
            if (quantity <= 0) {
                const next = { ...prev };
                delete next[item.id];
                return next;
            } else {
                return {
                    ...prev,
                    [item.id]: {
                        quantity,
                        name: itemName,
                        available: item.quantity
                    }
                };
            }
        });
    };

    const handleSubmit = async () => {
        const payload = Object.entries(selectedItems).map(([id, data]) => ({
            inventory_id: parseInt(id),
            quantity: data.quantity
        }));

        if (payload.length === 0) {
            toast.error("Please enter quantity for at least one item");
            return;
        }

        // Quick validation
        for (const [id, data] of Object.entries(selectedItems)) {
            if (data.quantity <= 0) {
                toast.error(`Quantity for ${data.name} must be greater than 0`);
                return;
            }
            if (data.quantity > data.available) {
                toast.error(`Quantity for ${data.name} exceeds available stock (${data.available})`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // POST /api/factory-inventory-usage/
            const response = await api.post("/api/sales/factory-inventory-usage/", payload);
            if (response.status === 201 || response.status === 200) {
                toast.success("Inventory usage recorded successfully");
                setSelectedItems({}); // Clear selection after success

                // Revalidate all inventory data
                mutateRaw();
                mutateBottles();
                mutateStickers();
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || "Failed to record inventory usage");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = rawLoading || bottlesLoading || stickersLoading;
    const hasError = rawError || bottlesError || stickersError;

    return (
        <div className="container mx-auto md:px-4 md:py-8 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-3xl font-bold">Use Factory Inventory</h1>
            </div>

            <div className="space-y-6">
                <Card className="py-0 gap-0 border-none shadow-none">
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Inventory List</CardTitle>
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search items..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <div className="space-y-6">
                        {isLoading ? (
                            <CardContent>
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            </CardContent>
                        ) : hasError ? (
                            <CardContent>
                                <div className="flex items-center gap-2 text-red-600 py-8 justify-center">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>Error loading inventory data. Please try again.</span>
                                </div>
                            </CardContent>
                        ) : (
                            <>
                                {/* Desktop View: Wrapped in CardContent */}
                                <div className="hidden md:block">
                                    <CardContent className="space-y-6">
                                        <div className="border rounded-md overflow-x-auto overflow-y-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="min-w-[200px]">Item Name</TableHead>
                                                        <TableHead className="min-w-[120px]">Category</TableHead>
                                                        <TableHead className="text-right whitespace-nowrap">Available</TableHead>
                                                        <TableHead className="w-[180px] text-right">Quantity to Use</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredItems.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                                No items found.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredItems.map((item) => {
                                                            const isSelected = !!selectedItems[item.id];
                                                            return (
                                                                <TableRow key={item.id} className={cn("hover:bg-muted/50 transition-colors", isSelected && "bg-slate-50")}>
                                                                    <TableCell className="font-medium">
                                                                        {typeof item.product === "string" ? item.product : item.product.name}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                                            {item.category}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-semibold">
                                                                        {item.quantity}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <div className="flex items-center justify-end">
                                                                            <Input
                                                                                type="number"
                                                                                min="0"
                                                                                max={item.quantity}
                                                                                value={isSelected ? selectedItems[item.id].quantity : ""}
                                                                                onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 0)}
                                                                                className={cn(
                                                                                    "w-28 text-right h-9 focus:border-gray-500 transition-all",
                                                                                    isSelected ? "border-gray-500" : "border-gray-200"
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </div>

                                {/* Mobile View: No CardContent wrapper to avoid padding */}
                                <div className="md:hidden px-2 space-y-4">
                                    {filteredItems.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No items found.
                                        </div>
                                    ) : (
                                        filteredItems.map((item) => {
                                            const isSelected = !!selectedItems[item.id];
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={cn(
                                                        "py-4 rounded-lg transition-all flex border px-2 ",
                                                        isSelected ? "bg-slate-50 border-gray-400" : "bg-white border-gray-100"
                                                    )}
                                                >
                                                    <div className="flex-1 space-y-1">
                                                        <p className="font-bold text-base leading-tight">
                                                            {typeof item.product === "string" ? item.product : item.product.name}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 tracking-wider ring-1 ring-inset ring-blue-700/10">
                                                                {item.category}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground font-medium">
                                                                Available: <span className="font-bold text-foreground">{item.quantity}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-24">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={item.quantity}
                                                            value={isSelected ? selectedItems[item.id].quantity : ""}
                                                            onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 0)}
                                                            className={cn(
                                                                "w-full text-right h-10 border-2 font-bold focus:border-gray-900 shadow-none",
                                                                isSelected ? "border-gray-500" : "border-gray-200"
                                                            )}
                                                            placeholder=""
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Footer: Responsive padding */}
                                <div className="px-0 md:px-6">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                                        <div className="text-sm text-muted-foreground">
                                            {Object.keys(selectedItems).length} item(s) selected for usage
                                        </div>
                                        <Button
                                            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 h-12"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || Object.keys(selectedItems).length === 0}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Confirm Usage
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

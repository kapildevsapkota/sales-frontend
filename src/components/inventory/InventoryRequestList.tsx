"use client"
import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { Package, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, Bell, User, MapPin, Calendar, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

const fetcher = (url: string) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
    }).then((res) => res.json());

export default function InventoryRequestList() {
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);

    const { data, error, isLoading } = useSWR<PaginatedResponse<InventoryRequest>>(
        `https://sales.baliyoventures.com/api/sales/inventory-request/?page=${page}`,
        fetcher
    );

    const handleStatusUpdate = async (id: number, status: string) => {
        setUpdatingId(id);
        try {
            const response = await api.patch(`/api/sales/inventory-request/${id}/`, { status });
            if (response.status === 200) {
                toast.success(`Request ${status.toLowerCase()} successfully`);
                mutate(`https://sales.baliyoventures.com/api/sales/inventory-request/?page=${page}`);
            }
        } catch (error) {
            console.error("Status update error:", error);
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Accepted":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Accepted</Badge>;
            case "Rejected":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejected</Badge>;
            default:
                return <Badge className="bg-yellow-101 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-800 rounded-xl border-2 border-red-100 flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                    <p className="font-bold">Failed to load Inventory Request</p>
                    <p className="text-sm opacity-80">Please check your connection or try again later.</p>
                </div>
            </div>
        );
    }

    const requests = data?.results || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Link href="/admin/inventory">
                    <ChevronLeft className="h-6 w-6 text-gray-600 hover:text-blue-600 transition-colors" />
                </Link>
                <h1 className="text-3xl font-bold">Inventory Request</h1>
            </div>


            <Card className="overflow-hidden border-gray-200">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/80 text-xs font-bold text-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-4">Franchise</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4">Total Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Actions</th>
                                    <th className="px-6 py-4">Items</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {requests.length > 0 ? (
                                    requests.map((request) => (
                                        <React.Fragment key={request.id}>
                                            <tr className="hover:bg-blue-50/10 transition-colors">
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-col capitalize">
                                                        <span className="font-bold text-gray-900">{request.franchise_name}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <User className="h-3 w-3" /> By {request.user.first_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground align-top">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {format(new Date(request.created_at), "dd-MM-yyyy HH:mm")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-blue-600 align-top">
                                                    Rs. {request.total_amount}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {getStatusBadge(request.status)}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {request.status === "Pending" ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50"
                                                                disabled={updatingId === request.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(request.id, "Rejected");
                                                                }}
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 px-3 bg-green-600 hover:bg-green-700"
                                                                disabled={updatingId === request.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(request.id, "Accepted");
                                                                }}
                                                            >
                                                                Accept
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-medium text-gray-500 italic">Action Taken</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 min-w-[200px]">
                                                    <div className="space-y-1.5">
                                                        {request.request_items.map((item) => (
                                                            <div key={item.id} className="flex items-center justify-between gap-4 text-xs bg-gray-50 p-1.5 rounded border border-gray-100">
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    <Package className="h-3 w-3 text-blue-400 shrink-0" />
                                                                    <span className="font-medium text-gray-700 truncate">{item.product_name}</span>
                                                                </div>
                                                                <span className="font-bold text-blue-600 shrink-0">x{item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground italic">
                                            No inventory requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {data && data.count > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, data.count)}</span> of <span className="font-medium">{data.count}</span> results
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!data.previous}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!data.next}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
    History,
    User,
    Calendar,
    Package,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type Product = {
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
    role: string;
};

type InventoryRequest = {
    id: number;
    user: UserInfo;
    request_items: RequestItem[];
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

export default function DispatchHistoryDialog() {
    const [page, setPage] = useState(1);

    const { data: requestsData, isLoading } = useSWR<PaginatedResponse<InventoryRequest>>(
        `https://zone-kind-centuries-finding.trycloudflare.com/api/sales/inventory-request/?page=${page}`,
        fetcher
    );

    const requests = requestsData?.results || [];

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

    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-gray-300 ">
                    <History className="h-4 w-4" />
                    <span>Dispatch History</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 border-b bg-gray-50/50">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <History className="h-6 w-6 text-gray-600" />
                        Dispatch History
                    </DialogTitle>
                    <DialogDescription>
                        Track all historical inventory dispatch requests and their statuses.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="min-w-full inline-block align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 ">Franchise</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 ">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 ">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 ">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 ">Items</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {requests.map((request) => (
                                            <React.Fragment key={request.id}>
                                                <tr className="hover:bg-blue-50/10 transition-colors">
                                                    <td className="px-6 py-4 capitalize align-top">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900">{request.franchise_name}</span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <User className="h-3 w-3" /> {request.user.first_name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {format(new Date(request.created_at), "dd-MM-yyyy HH:mm")}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600 align-top">
                                                        Rs. {request.total_amount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap align-top">
                                                        {getStatusBadge(request.status)}
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground italic">
                            No dispatch history found.
                        </div>
                    )}
                </div>

                {requestsData && requestsData.count > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, requestsData.count)}</span> of <span className="font-medium">{requestsData.count}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!requestsData.previous}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={!requestsData.next}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

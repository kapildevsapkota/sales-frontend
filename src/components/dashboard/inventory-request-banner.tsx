import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { useAuth, Role } from "@/contexts/AuthContext";

interface InventoryRequestResponse {
    count: number;
}

export const InventoryRequestBanner: React.FC = () => {
    const { user } = useAuth();
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only fetch if user is a Franchise
        if (user?.role !== Role.Franchise) {
            setLoading(false);
            return;
        }

        api
            .get("/api/sales/inventory-request/?status=pending")
            .then((res) => {
                setCount(res.data.count);
            })
            .catch((err) => {
                console.error("Failed to fetch inventory requests:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [user?.role]);

    if (loading || user?.role !== Role.Franchise || count === 0) return null;

    return (
        <Link
            href="/admin/inventory/inventory-request"
            className="block rounded-md border border-blue-200 bg-blue-50 p-4 mb-4 shadow-sm hover:bg-blue-100 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <PackageSearch size={24} />
                </div>
                <div>
                    <h2 className="font-semibold text-base text-blue-900">
                        Pending Inventory Requests
                    </h2>
                    <p className="mt-1 text-sm text-blue-700">
                        There are <span className="font-bold">{count}</span> new inventory
                        requests requiring your attention. Click to view and manage them.
                    </p>
                </div>
                <div className="ml-auto">
                    <span className="text-blue-500 font-medium text-sm flex items-center gap-1">
                        View Requests
                        <span className="text-lg">→</span>
                    </span>
                </div>
            </div>
        </Link>
    );
};

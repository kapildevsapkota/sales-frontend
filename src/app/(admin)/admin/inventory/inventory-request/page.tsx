import { Metadata } from "next";
import InventoryRequestList from "@/components/inventory/InventoryRequestList";

export const metadata: Metadata = {
    title: "Inventory Request | Yachu Hair Oil",
    description: "View and manage inventory requests and notifications",
};

export default function InventoryRequestPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <InventoryRequestList />
        </div>
    );
}

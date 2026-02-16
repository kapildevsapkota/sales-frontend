import { Metadata } from "next";
import DispatchManagement from "@/components/inventory/factory/DispatchManagement";

export const metadata: Metadata = {
    title: "Dispatch Management | Yachu Hair Oil",
    description: "Manage product dispatch from factory to franchises",
};

export default function DispatchPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <DispatchManagement />
        </div>
    );
}

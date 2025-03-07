import { Metadata } from "next";
import InventoryDashboard from "@/components/inventory/InventoryDashboard";

export const metadata: Metadata = {
  title: "Inventory Management | Yachu Hair Oil",
  description: "Inventory management system for Yachu Hair Oil Nepal",
};

export default function InventoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <InventoryDashboard />
    </div>
  );
}

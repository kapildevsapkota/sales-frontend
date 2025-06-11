import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface LowQuantityItem {
  product_name: string;
  quantity: number;
  status: "critical" | "low";
}

interface InventoryCheckResponse {
  low_quantity_items: LowQuantityItem[];
  total_low_items: number;
}

export const InventoryBanner: React.FC<{ id?: string }> = ({ id }) => {
  const [data, setData] = useState<InventoryCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/api/sales/inventory-check/${id ? `?franchise=${id}` : ""}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to fetch inventory status."))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data || data.total_low_items === 0) return null;

  if (error) {
    return (
      <div className="rounded-md border border-red-400 bg-red-50 p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl">❌</span>
          <div>
            <h2 className="font-semibold text-base text-red-900">
              Inventory Check Failed
            </h2>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-yellow-400 bg-yellow-50 p-4 mb-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <h2 className="font-semibold text-base text-yellow-900">
            Inventory Alert: {data.total_low_items} item
            {data.total_low_items > 1 ? "s" : ""} low in stock!
          </h2>
          <ul className="mt-2 ml-4 list-disc text-sm text-yellow-800">
            {data.low_quantity_items.map((item) => (
              <li
                key={item.product_name}
                className={
                  item.status === "critical"
                    ? "font-semibold text-red-700"
                    : "text-yellow-700"
                }
              >
                {item.product_name}:{" "}
                <span className="inline-block w-8 text-center font-mono">
                  {item.quantity}
                </span>{" "}
                left ({item.status})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

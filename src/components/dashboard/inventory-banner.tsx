import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface LowQuantityItem {
  product_name: string;
  quantity: number;
  status: "critical" | "low";
}

interface BasicInventoryResponse {
  low_quantity_items: LowQuantityItem[];
  total_low_items: number;
}

interface SuperAdminInventoryResponse {
  factory: BasicInventoryResponse;
  distributors: Record<string, BasicInventoryResponse>;
  franchises: Record<string, BasicInventoryResponse>;
}

type InventoryCheckResponse =
  | BasicInventoryResponse
  | SuperAdminInventoryResponse;

const isSuperAdminResponse = (
  data: InventoryCheckResponse
): data is SuperAdminInventoryResponse => {
  return "factory" in data || "distributors" in data || "franchises" in data;
};

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

  if (loading || !data) return null;

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

  // Handle basic response (non-superadmin)
  if (!isSuperAdminResponse(data)) {
    if (data.total_low_items === 0) return null;

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
              {(data.low_quantity_items || []).map((item) => (
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
  }

  // Handle superadmin response
  const sections = [
    { key: "factory", label: "Factory", data: data.factory },
    ...Object.entries(data.distributors || {}).map(([name, d]) => ({
      key: `distributor-${name}`,
      label: `${name} (Distributor)`,
      data: d,
    })),
    ...Object.entries(data.franchises || {}).map(([name, f]) => ({
      key: `franchise-${name}`,
      label: `${name} (Franchise)`,
      data: f,
    })),
  ];

  const sectionsWithIssues = sections.filter(
    (section) => section.data.total_low_items > 0
  );

  if (sectionsWithIssues.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {sectionsWithIssues.map((section) => (
        <div
          key={section.key}
          className="rounded-md border border-yellow-400 bg-yellow-50 p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h2 className="font-semibold text-base text-yellow-900">
                {section.label}: {section.data.total_low_items} item
                {section.data.total_low_items > 1 ? "s" : ""} low in stock!
              </h2>
              <ul className="mt-2 ml-4 list-disc text-sm text-yellow-800">
                {(section.data.low_quantity_items || []).map((item) => (
                  <li
                    key={`${section.key}-${item.product_name}`}
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
      ))}
    </div>
  );
};

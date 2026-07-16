import { FolderCog, Target, Truck, LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  items: {
    status: string;
    nos: number;
    amount: string | number;
  }[];
}

interface CardConfig {
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  iconText: string;
}

const CARD_CONFIG: Record<string, CardConfig> = {
  "orders processing": {
    icon: FolderCog,
    accent: "bg-blue-300",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
  },
  "orders dispatched": {
    icon: Truck,
    accent: "bg-amber-300",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  "orders status": {
    icon: Target,
    accent: "bg-emerald-300",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
};

export function SummaryCard({ title, items }: SummaryCardProps) {
  const config =
    CARD_CONFIG[title.toLowerCase()] ?? CARD_CONFIG["orders processing"];
  const Icon = config.icon;
  const totalNos = items.reduce((sum, item) => sum + item.nos, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200  overflow-hidden">
      {/* Color-coded accent bar identifies the card type at a glance */}
      <div className={`h-1 w-full ${config.accent}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-lg ${config.iconBg}`}
            >
              <Icon className={`w-4 h-4 ${config.iconText}`} />
            </span>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {totalNos} total
          </span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
            >
              <span className="text-sm text-gray-500">{item.status}</span>
              <div className="flex items-center gap-5">
                <span className="text-sm font-semibold text-gray-900 tabular-nums w-6 text-right">
                  {item.nos}
                </span>
                <span className="text-sm font-medium text-gray-700 tabular-nums w-20 text-right">
                  Rs. {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { VendorCompleteStat } from "@/src/services/vendors";

export function DeliveryPerformanceCard({
  data,
}: {
  data?: VendorCompleteStat;
}) {
  const delivered = data?.delivery_performance.delivered_percentage ?? 0;
  const cancelled = data?.delivery_performance.cancelled_percentage ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3.5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Delivery Performance
      </h3>

      {/* Simple two-segment bar for a quick visual read */}
      <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-100 mb-4">
        <div
          className="bg-emerald-500"
          style={{ width: `${Math.min(delivered, 100)}%` }}
        />
        <div
          className="bg-red-400"
          style={{ width: `${Math.min(cancelled, 100)}%` }}
        />
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Delivered
          </span>
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {delivered.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Cancelled
          </span>
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {cancelled.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

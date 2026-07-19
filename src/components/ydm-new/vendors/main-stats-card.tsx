import { VendorCompleteStat } from "./vendors";

export function MainStatsCard({ data }: { data?: VendorCompleteStat }) {
  const formatAmount = (amt: number) => amt.toLocaleString("en-IN");

  const lastPayment = data?.overall_statistics.last_cod_payment;

  const rows = [
    {
      label: "Total orders",
      value: data?.overall_statistics.total_order.nos ?? 0,
    },
    {
      label: "Total COD",
      value: `Rs. ${data ? formatAmount(data.overall_statistics.total_cod.amount) : "0"}`,
    },
    {
      label: "Pending RTV",
      value: data?.overall_statistics.total_rtv.nos ?? 0,
    },
    {
      label: "Total delivery charge",
      value: `Rs. ${data ? formatAmount(data.overall_statistics.total_delivery_charge.amount) : "0"}`,
    },
    {
      label: "Total pending COD",
      value: `Rs. ${data ? formatAmount(data.overall_statistics.total_pending_cod.amount) : "0"}`,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Overview</h3>
      <div className="divide-y divide-gray-100">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center py-2.5 first:pt-0"
          >
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-semibold text-gray-900 tabular-nums">
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center py-2.5 last:pb-0">
          <span className="text-sm text-gray-500">Last COD payment</span>
          <span className="text-sm font-medium text-gray-700">
            {lastPayment ? (
              <div className="flex flex-col items-end">
                <span>Rs. {formatAmount(lastPayment.amount)}</span>
                <span className="text-xs text-gray-500">
                  {new Date(lastPayment.date).toLocaleDateString("en-IN")}
                </span>
              </div>
            ) : (
              "—"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

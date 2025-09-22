"use client";

import type { Invoice } from "@/types/invoice";

type InvoiceDetailsCardProps = {
  invoice: Invoice;
  formatCurrency: (amount: string | number) => string;
};

export function InvoiceDetailsCard({
  invoice: inv,
  formatCurrency,
}: InvoiceDetailsCardProps) {
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
      <div className="border-b-4 border-black p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">YDM</h1>
            <p className="text-gray-700 text-sm font-medium uppercase tracking-wide">
              Professional Business Services
            </p>
            <div className="mt-4 space-y-1 text-gray-600 text-sm">
              <p>Kathmandu, Nepal</p>
              <p>Phone: +977-981-3492594</p>
              <p>Email: ydmnepal@gmail.com</p>
            </div>
          </div>
          <div className="text-right border-2 border-black p-4">
            <h2 className="text-2xl font-bold text-black mb-1 tracking-wider">
              INVOICE
            </h2>
            <p className="text-gray-700 font-mono text-sm font-semibold">
              {inv.invoice_code || "INV-XXXX-XXX"}
            </p>
            <div className="mt-3">
              <div className="inline-block border-2 border-gray-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-700">
                {inv.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-black mb-3 border-b-2 border-gray-400 pb-2 uppercase tracking-wide">
              Invoice To
            </h3>
            <div className="space-y-2">
              <p className="text-black font-bold text-lg capitalize">{`Franchise #${inv.franchise}`}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black mb-3 border-b-2 border-gray-400 pb-2 uppercase tracking-wide">
              Invoice Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm font-medium">
                  Invoice Date:
                </span>
                <span className="text-black font-bold text-sm">
                  {new Date(inv.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Payment Type:</span>
                <span className="text-black font-bold">{inv.payment_type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-gray-300 bg-gray-50 p-6 mb-6">
          <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-wide">
            Payment Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b-2 border-gray-300">
              <span className="text-black font-bold text-lg uppercase tracking-wide">
                Total Amount
              </span>
              <span className="text-3xl font-bold text-black font-mono">
                {formatCurrency(inv.total_amount)}
              </span>
            </div>
            {Number.parseFloat(inv.paid_amount) > 0 ? (
              <div className="flex justify-between items-center py-2 border border-gray-400 bg-white px-3">
                <span className="font-bold text-gray-700 uppercase tracking-wide">
                  Amount Paid
                </span>
                <span className="font-mono font-bold text-lg text-black">
                  {formatCurrency(inv.paid_amount)}
                </span>
              </div>
            ) : null}
            {Number.parseFloat(inv.due_amount) > 0 ? (
              <div className="flex justify-between items-center py-3 border-2 border-black bg-white px-3">
                <span className="font-bold text-black uppercase tracking-wide text-lg">
                  Amount Due
                </span>
                <span className="font-mono font-bold text-xl text-black">
                  {formatCurrency(inv.due_amount)}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {inv.signature ? (
          <div className="border-t-2 border-gray-400 pt-8">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <div className="mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inv.signature}
                    alt="Signature"
                    className="h-16 object-contain"
                  />
                </div>
                <div className="border-b-2 border-black w-64 mb-3"></div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default InvoiceDetailsCard;

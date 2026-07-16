"use client";

import { BarChart2, ClipboardList, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVendors } from "./vendors.queries";

export function VendorsView() {
  const router = useRouter();
  const { data: vendors, isLoading, isError } = useVendors();

  if (isLoading) {
    return (
      <div className="p-6 md:px-8 md:py-6 max-w-screen-xl mx-auto w-full flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#e8611a]" />
      </div>
    );
  }

  if (isError || !vendors) {
    return (
      <div className="p-6 md:px-8 md:py-6 max-w-screen-xl mx-auto w-full">
        <div className="bg-red-50 text-red-500 p-4 rounded border border-red-200">
          Failed to load vendors. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:px-8 md:py-6 max-w-screen-xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl text-black font-medium">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1 font-light">
            Manage and view all vendors
          </p>
        </div>
        <span className="text-sm text-gray-500 font-light border border-gray-200 rounded px-2.5 py-1">
          {vendors.length} Total
        </span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-gray-500 font-normal w-10">#</th>
              <th className="text-left px-4 py-3 text-gray-500 font-normal">Vendor Name</th>
              <th className="text-left px-4 py-3 text-gray-500 font-normal">Contacts</th>
              <th className="text-left px-4 py-3 text-gray-500 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No vendors found.
                </td>
              </tr>
            ) : (
              vendors.map((franchise, index) => (
                <tr
                  key={franchise.id}
                  onClick={() => router.push(`/dashboard/${franchise.slug}`)}
                  className={`cursor-pointer border-b border-gray-100 last:border-0 align-top transition-colors hover:bg-gray-50/60 ${
                    index === 0 ? "bg-red-50/20" : ""
                  }`}
                >
                  {/* # */}
                  <td className="px-4 py-3.5 text-gray-400 font-light">{franchise.id}</td>

                  {/* Franchise Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-black font-medium">{franchise.name}</span>
                      {franchise.newOrders !== undefined && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-normal text-white bg-[#e8611a]">
                          {franchise.newOrders} New Orders
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Contacts */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      {franchise.contacts.map((contact, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 border border-gray-200 rounded px-2.5 py-1 text-xs w-fit min-w-[220px]"
                        >
                          <span className="text-black font-normal">{contact.name}</span>
                          <span className="text-gray-400 font-light">{contact.phone}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        <BarChart2 className="h-3.5 w-3.5 text-gray-400" />
                        Analytics
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 font-normal border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        <ClipboardList className="h-3.5 w-3.5 text-gray-400" />
                        Orders
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

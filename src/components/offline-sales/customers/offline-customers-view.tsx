"use client";

import { useState } from "react";
import { OfflineCustomer } from "@/types/offline-sales";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  Phone,
  Building,
  ShoppingBag,
  CreditCard,
  UserCheck,
  Calendar,
} from "lucide-react";
import Link from "next/link";

// Initial seed data reflecting the schema from the offline order API
const INITIAL_CUSTOMERS: OfflineCustomer[] = [
  {
    id: 3,
    name: "Test Store",
    contact_person: "Ram",
    phone: "64649896565",
    address: "Kathmandu, Bagmati",
    franchise_id: 5,
    franchise_name: "Test Franchises",
    total_orders: 1,
    total_spent: 5000,
    remaining_balance: 4500,
    last_order_date: "2026-10-29",
    is_active: true,
  },
  {
    id: 4,
    name: "Apex Retail Mart",
    contact_person: "Sita Sharma",
    phone: "9841234567",
    address: "Pokhara, Kaski",
    franchise_id: 5,
    franchise_name: "Test Franchises",
    total_orders: 3,
    total_spent: 18500,
    remaining_balance: 0,
    last_order_date: "2026-10-28",
    is_active: true,
  },
  {
    id: 5,
    name: "Himalayan Herbal Outlet",
    contact_person: "Bikash Thapa",
    phone: "9812987654",
    address: "Biratnagar, Morang",
    franchise_id: 2,
    franchise_name: "Eastern Hub",
    total_orders: 5,
    total_spent: 34200,
    remaining_balance: 6200,
    last_order_date: "2026-10-27",
    is_active: true,
  },
];

export function OfflineCustomersView() {
  const [customers] = useState<OfflineCustomer[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.franchise_name &&
        c.franchise_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalClients = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + (c.remaining_balance || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Offline Clients
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalClients}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Registered retail & field stores
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Offline Volume
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Rs. {totalRevenue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cumulative sales from field clients
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Outstanding Balance
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                Rs. {totalOutstanding.toLocaleString()}
              </h3>
              <p className="text-[11px] text-amber-600/70 mt-0.5">
                Credit pending collection
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Customers List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by client name, contact, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/offline-sales/orders">
              <Button variant="outline" className="h-10 rounded-xl text-xs sm:text-sm gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>View Orders</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-neutral-800/80 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Client / Store</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Franchise</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Spent</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4 text-center">Last Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                      No matching offline customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {customer.name}
                        </div>
                        {customer.address && (
                          <div className="text-[11px] text-slate-400">
                            {customer.address}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                        {customer.contact_person}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <a
                          href={`tel:${customer.phone}`}
                          className="flex items-center gap-1 text-purple-600 hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-slate-400" />
                          {customer.franchise_name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="secondary" className="font-medium text-xs">
                          {customer.total_orders} orders
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-900 dark:text-white">
                        Rs. {(customer.total_spent || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold">
                        {(customer.remaining_balance || 0) > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            Rs. {customer.remaining_balance?.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Cleared
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                        <span className="flex items-center justify-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {customer.last_order_date || "N/A"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

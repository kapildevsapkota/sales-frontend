"use client";

import React, { useEffect, useState } from "react";
import { CustomerTreatment } from "@/types/treatment";
import { getCustomerTreatments, deleteCustomerTreatment } from "@/api/treatment";
import { CustomerTreatmentForm } from "./CustomerTreatmentForm";
import { TreatmentDetailView } from "./TreatmentDetailView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Loader2,
  Eye,
  Trash2,
  Calendar,
  Phone,
  User,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  treatmentType?: string;
  title?: string;
}

export default function TreatmentStaffManager({ treatmentType, title = "Customer Treatments" }: Props) {
  const [customers, setCustomers] = useState<CustomerTreatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerTreatment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerTreatment | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCustomers = async (searchQuery?: string) => {
    setLoading(true);
    try {
      const data = await getCustomerTreatments(searchQuery, treatmentType);
      setCustomers(data);
      // If a customer detail view is active, update selectedCustomer state as well
      setSelectedCustomer((prev) => {
        if (!prev) return null;
        return data.find((c) => c.id === prev.id) || prev;
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load customer treatment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, [treatmentType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete treatment record for ${name}?`)) return;
    setDeletingId(id);
    try {
      await deleteCustomerTreatment(id);
      toast.success(`Treatment record for ${name} deleted successfully.`);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
      fetchCustomers(search);
    } catch (err: any) {
      toast.error("Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: CustomerTreatment["payment_status"]) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-emerald-500 text-white">Paid</Badge>;
      case "Partial":
        return <Badge className="bg-amber-500 text-white">Partial</Badge>;
      case "Pending":
        return <Badge className="bg-rose-500 text-white">Pending</Badge>;
      case "Free":
        return <Badge className="bg-purple-500 text-white">Free</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render detail view if a customer is selected
  if (selectedCustomer) {
    return (
      <TreatmentDetailView
        customer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
        onRefresh={() => fetchCustomers(search)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Register patients, track periodic 4-day progress photos, and manage billing.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null);
            setIsFormOpen(true);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Customer Treatment
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer name or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <Button type="submit" variant="secondary" className="gap-1">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Customer Treatments Table */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading treatment records...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-2">
              <Activity className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
              <p className="font-medium text-gray-700">No customer treatment records found</p>
              <p className="text-xs text-gray-400">
                Click "New Customer Treatment" above to register a patient.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-slate-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                  <tr>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Treatment Type</th>
                    <th className="px-6 py-3.5">Progress Photos</th>
                    <th className="px-6 py-3.5">Total / Paid</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{c.name}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {c.phone_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {c.treatment_type_display || c.treatment_type}
                          </span>
                          {c.package_display && (
                            <span className="text-xs text-teal-600">{c.package_display}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 font-medium text-slate-700 border">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {c.images ? c.images.length : 0} Photos
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {c.treatment_type === "package_member" ? (
                            <>
                              <span className="font-semibold text-gray-900">
                                Rs. {(c.calculated_total_amount || 0).toLocaleString()}
                              </span>
                              <span className="text-xs text-emerald-600">
                                Paid: Rs. {(c.total_paid || 0).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-gray-900">
                              Rs. {(c.total_paid || 0).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(c.payment_status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(c)}
                            className="h-8 gap-1.5 text-xs text-teal-700 hover:text-teal-800 border-teal-200 bg-teal-50/50 hover:bg-teal-100"
                          >
                            <Eye className="w-3.5 h-3.5" /> View & Upload
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === c.id}
                            onClick={() => handleDelete(c.id, c.name)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            {deletingId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer Treatment" : "New Customer Treatment Record"}
            </DialogTitle>
          </DialogHeader>
          <CustomerTreatmentForm
            initialData={editingCustomer}
            onSuccess={() => {
              setIsFormOpen(false);
              fetchCustomers(search);
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

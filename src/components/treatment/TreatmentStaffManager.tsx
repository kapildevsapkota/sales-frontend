"use client";

import React, { useEffect, useState } from "react";
import { CustomerTreatment } from "@/types/treatment";
import {
  getCustomerTreatments,
  deleteCustomerTreatment,
} from "@/api/treatment";
import { CustomerTreatmentForm } from "./CustomerTreatmentForm";
import { TreatmentDetailView } from "./TreatmentDetailView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Filter,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Props {
  treatmentType?: string;
  title?: string;
}

export default function TreatmentStaffManager({
  treatmentType,
  title = "Customer Treatments",
}: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerTreatment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerTreatment | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filters state based on django CustomerTreatmentFilter
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<string>(
    treatmentType || "all",
  );
  const [selectedPackage, setSelectedPackage] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const activeType =
    treatmentType ||
    (selectedTreatmentType !== "all" ? selectedTreatmentType : undefined);
  const filterParams = {
    search: search || undefined,
    treatment_type: activeType,
    package: selectedPackage !== "all" ? selectedPackage : undefined,
    payment_method:
      selectedPaymentMethod !== "all" ? selectedPaymentMethod : undefined,
    start_date: startDate ? new Date(startDate).toISOString() : undefined,
    end_date: endDate ? new Date(endDate).toISOString() : undefined,
  };

  const {
    data: customers = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["customer_treatments", filterParams],
    queryFn: () => getCustomerTreatments(filterParams),
  });

  const fetchCustomers = () => {
    refetch();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedTreatmentType(treatmentType || "all");
    setSelectedPackage("all");
    setSelectedPaymentMethod("all");
    setStartDate("");
    setEndDate("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(`Are you sure you want to delete treatment record for ${name}?`)
    )
      return;
    setDeletingId(id);
    try {
      await deleteCustomerTreatment(id);
      toast.success(`Treatment record for ${name} deleted successfully.`);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
      refetch();
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
    const activeCustomer =
      customers.find((c) => c.id === selectedCustomer.id) || selectedCustomer;
    return (
      <TreatmentDetailView
        customer={activeCustomer}
        onBack={() => setSelectedCustomer(null)}
        onRefresh={() => refetch()}
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
            Register patients, track periodic 4-day progress photos, and manage
            billing.
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

      {/* Filter and Search Controls */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>

            {/* Treatment Type Filter (Hidden if page forces specific treatmentType) */}
            {!treatmentType && (
              <Select
                value={selectedTreatmentType}
                onValueChange={(val) => setSelectedTreatmentType(val)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Treatment Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Treatment Types</SelectItem>
                  <SelectItem value="package_member">Package Member</SelectItem>
                  <SelectItem value="bottle_member">Bottle Member</SelectItem>
                  <SelectItem value="home_oil">Home Oil</SelectItem>
                  <SelectItem value="one_time_service">
                    One Time Service
                  </SelectItem>
                  <SelectItem value="free_service">Free Service</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Package Filter */}
            <Select
              value={selectedPackage}
              onValueChange={(val) => setSelectedPackage(val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Packages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="one_month">1 Month</SelectItem>
                <SelectItem value="two_month">2 Month</SelectItem>
                <SelectItem value="three_month">3 Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select
              value={selectedPaymentMethod}
              onValueChange={(val) => setSelectedPaymentMethod(val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Payment Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            {/* Start Date */}
            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white text-xs"
                placeholder="Start Date"
              />
            </div>

            {/* End Date */}
            <div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white text-xs"
                placeholder="End Date"
              />
            </div>

            {/* Reset Button */}
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="w-full gap-1.5 text-xs text-gray-600"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </Button>
            </div>
          </div>
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
              <p className="font-medium text-gray-700">
                No customer treatment records found
              </p>
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
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">
                            {c.name}
                          </span>
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
                            <span className="text-xs text-teal-600">
                              {c.package_display}
                            </span>
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
                                Rs.{" "}
                                {(
                                  c.calculated_total_amount || 0
                                ).toLocaleString()}
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
                      <td className="px-6 py-4">
                        {getStatusBadge(c.payment_status)}
                      </td>
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
              {editingCustomer
                ? "Edit Customer Treatment"
                : "New Customer Treatment Record"}
            </DialogTitle>
          </DialogHeader>
          <CustomerTreatmentForm
            initialData={editingCustomer}
            onSuccess={() => {
              setIsFormOpen(false);
              refetch();
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

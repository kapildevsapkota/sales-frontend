"use client";

import React, { useState } from "react";
import { CustomerTreatment } from "@/types/treatment";
import { PeriodicImageUploader } from "./PeriodicImageUploader";
import { PaymentRecordForm } from "./PaymentRecordForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  PlusCircle,
  FileText,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

interface Props {
  customer: CustomerTreatment;
  onBack: () => void;
  onRefresh: () => void;
}

export const TreatmentDetailView: React.FC<Props> = ({ customer, onBack, onRefresh }) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Status Badge styling helper
  const getStatusBadge = (status: CustomerTreatment["payment_status"]) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Paid</Badge>;
      case "Partial":
        return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Partial</Badge>;
      case "Pending":
        return <Badge className="bg-rose-500 text-white hover:bg-rose-600">Pending</Badge>;
      case "Free":
        return <Badge className="bg-purple-500 text-white hover:bg-purple-600">Free</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {customer.name}
              {getStatusBadge(customer.payment_status)}
            </h1>
            <p className="text-xs text-gray-500">
              Customer ID: #{customer.id} • Registered on {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {customer.payment_status !== "Paid" && customer.payment_status !== "Free" && (
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm flex-1 sm:flex-initial"
            >
              <PlusCircle className="h-4 w-4" /> Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Service Info Card */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-teal-600" /> Patient Info & Treatment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{customer.phone_number}</span>
            </div>
            {customer.address && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>{customer.address}</span>
              </div>
            )}
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Treatment Type:</span>
                <span className="font-semibold text-gray-800">
                  {customer.treatment_type_display || customer.treatment_type}
                </span>
              </div>
              {customer.package_display && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Package:</span>
                  <span className="font-semibold text-teal-700">{customer.package_display}</span>
                </div>
              )}
              {customer.service_by_details && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Serviced By:</span>
                  <span className="font-medium text-gray-700">
                    {customer.service_by_details.full_name || customer.service_by_details.username}
                  </span>
                </div>
              )}
              {customer.reason && (
                <div className="bg-purple-50 p-2.5 rounded-lg text-xs text-purple-900 space-y-1">
                  <span className="font-semibold block">Reason for Free Service:</span>
                  <p>{customer.reason}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-teal-600" /> Billing & Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Amount:</span>
              <span className="font-bold text-gray-900 text-base">
                Rs. {(customer.calculated_total_amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-700">
              <span>Total Paid:</span>
              <span className="font-semibold">
                Rs. {(customer.total_paid || 0).toLocaleString()}
              </span>
            </div>
            {customer.payment_method_display && (
              <div className="flex justify-between items-center text-gray-600 text-xs">
                <span>Initial Payment Method:</span>
                <span className="font-medium capitalize">{customer.payment_method_display}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-rose-600 border-t pt-2 font-bold">
              <span>Due Balance:</span>
              <span className="text-lg">
                Rs. {(customer.due_amount || 0).toLocaleString()}
              </span>
            </div>

            {customer.payment_screenshot && (
              <div className="border-t pt-3 mt-3">
                <span className="text-xs text-gray-500 font-medium block mb-1">
                  Initial Payment Receipt:
                </span>
                <a
                  href={customer.payment_screenshot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Receipt Image
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History List */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-teal-600" /> Payment History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!customer.payment_history || customer.payment_history.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                No payments recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customer.payment_history.map((pmt) => (
                  <div
                    key={pmt.id}
                    className="p-2.5 rounded-lg border bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-semibold text-gray-800">
                      <span>Rs. {parseFloat(pmt.amount).toLocaleString()}</span>
                      <span className="capitalize text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                        {pmt.payment_method_display || pmt.payment_method}
                      </span>
                    </div>
                    {pmt.remarks && <p className="text-gray-500">{pmt.remarks}</p>}
                    <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                      <span>By: {pmt.created_by_details?.full_name || "Staff"}</span>
                      <span>{new Date(pmt.payment_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Periodic 4-Day Progress Image Uploader Module */}
      <PeriodicImageUploader customer={customer} onUpdate={onRefresh} />

      {/* Payment Dialog Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment for {customer.name}</DialogTitle>
          </DialogHeader>
          <PaymentRecordForm
            customer={customer}
            onSuccess={() => {
              setIsPaymentModalOpen(false);
              onRefresh();
            }}
            onCancel={() => setIsPaymentModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from "@/types/invoice";
import { toast } from "@/hooks/use-toast";
import InvoiceViewDialog from "./InvoiceViewDialog";
import InvoiceReportDialog from "./InvoiceReportDialog";
import { Button } from "@/components/ui/button";
import { downloadInvoicePDF } from "../utils/invoice-pdf";

type InvoiceTableProps = {
  invoices: Invoice[];
  isLoading?: boolean;
  onCreate?: () => void;
  onEdit?: (invoiceId: number) => void;
  onDownloadPdf?: (invoice: Invoice) => void;
  onRefresh?: () => void;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";
    case "Partially Paid":
      return "bg-yellow-100 text-yellow-700";
    case "Pending":
      return "bg-gray-100 text-gray-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// API function to update invoice approval status
const updateInvoiceApproval = async (
  invoiceId: number,
  isApproved: boolean
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/logistics/invoice/${invoiceId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({
        is_approved: isApproved,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update invoice: ${errorText}`);
  }

  return response.json();
};

export function InvoiceTable({
  invoices,
  isLoading = false,
  onRefresh,
}: InvoiceTableProps) {
  const router = useRouter();
  const [approvalLoading, setApprovalLoading] = useState<number | null>(null);
  const [reportOpenForId, setReportOpenForId] = useState<number | null>(null);
  const [reportComments, setReportComments] = useState<string>("");
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [viewOpenForId, setViewOpenForId] = useState<number | null>(null);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [invoiceComments, setInvoiceComments] = useState<
    Array<{ id: number; invoice: number; comment: string; created_at?: string }>
  >([]);
  const [viewSubmitting, setViewSubmitting] = useState<boolean>(false);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
    return Number.isFinite(num)
      ? `Nrs ${num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "Nrs 0.00";
  };

  const handleApprovalToggle = async (
    invoiceId: number,
    currentStatus: boolean
  ) => {
    try {
      setApprovalLoading(invoiceId);
      await updateInvoiceApproval(invoiceId, !currentStatus);

      toast({
        title: "Success",
        description: `Invoice ${
          !currentStatus ? "approved" : "unapproved"
        } successfully`,
      });

      // Refresh the invoice list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update approval status",
        variant: "destructive",
      });
    } finally {
      setApprovalLoading(null);
    }
  };

  const reportInvoice = async (invoiceId: number, comments: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/logistics/invoice-report/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          invoice: invoiceId,
          comment: comments,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit report: ${errorText}`);
    }

    return response.json();
  };

  const handleSubmitReport = async () => {
    if (!reportOpenForId) return;
    try {
      setReportLoading(true);
      await reportInvoice(reportOpenForId, reportComments.trim());
      toast({
        title: "Reported",
        description: "Invoice reported successfully",
      });
      setReportOpenForId(null);
      setReportComments("");
      if (onRefresh) onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const fetchInvoiceReports = async (invoiceId: number) => {
    setCommentsLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/logistics/invoice-report/?invoice=${invoiceId}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to load comments");
      }
      const data = await response.json();
      // Expecting an array; fall back to empty array if not
      setInvoiceComments(Array.isArray(data) ? data : []);
    } catch (error) {
      setInvoiceComments([]);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (viewOpenForId) {
      fetchInvoiceReports(viewOpenForId);
    } else {
      setInvoiceComments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewOpenForId]);

  const handleAddViewCommentText = async (text: string) => {
    if (!viewOpenForId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      setViewSubmitting(true);
      await reportInvoice(viewOpenForId, trimmed);
      await fetchInvoiceReports(viewOpenForId);
      toast({ title: "Success", description: "Comment added." });
      if (onRefresh) onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setViewSubmitting(false);
    }
  };

  const handleDownloadPdf = async (inv: Invoice) => {
    try {
      const invoiceData = {
        invoiceCode: inv.invoice_code,
        totalAmount: String(inv.total_amount ?? "0"),
        paidAmount: String(inv.paid_amount ?? "0"),
        dueAmount: String(inv.due_amount ?? "0"),
        // Narrow types from util expect specific literals; cast for flexibility
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paymentType: inv.payment_type as unknown as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: inv.status as unknown as any,
        franchise: String(inv.franchise ?? ""),
        createdBy: String(inv.created_by ?? ""),
        signedBy: "",
        signatureDate: inv.approved_at
          ? new Date(inv.approved_at).toLocaleDateString()
          : "",
        notes: "",
        signature: inv.signature ?? null,
      };

      const franchiseName = String(inv.franchise ?? "");
      await downloadInvoicePDF(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invoiceData as any,
        franchiseName,
        inv.signature ?? undefined
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Invoices</h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="font-semibold">S.N.</TableHead>
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Total</TableHead>
              <TableHead className="font-semibold">Paid</TableHead>
              <TableHead className="font-semibold">Due</TableHead>
              <TableHead className="font-semibold">Payment Type</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Approved</TableHead>
              <TableHead className="font-semibold">Created At</TableHead>
              <TableHead className="font-semibold">Signature</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="py-8 text-center text-gray-500"
                >
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="py-8 text-center text-gray-500"
                >
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv, idx) => (
                <TableRow
                  key={inv.id}
                  className="border-gray-50 hover:bg-gray-50/50"
                >
                  <TableCell className="font-medium">{idx + 1}</TableCell>
                  <TableCell>
                    <span
                      className="font-mono text-sm text-primary font-medium cursor-pointer hover:underline"
                      onClick={() => router.push(`#`)}
                    >
                      {inv.invoice_code}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {Number(inv.total_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {Number(inv.paid_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {Number(inv.due_amount).toLocaleString()}
                  </TableCell>
                  <TableCell>{inv.payment_type}</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs font-medium hover:bg-trasnparent ${getStatusColor(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`${
                      inv.is_approved ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {inv.is_approved ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>{formatDateTime(inv.created_at)}</TableCell>
                  <TableCell>
                    {inv.signature ? (
                      <a
                        href={inv.signature}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap flex items-center gap-2">
                    <InvoiceViewDialog
                      invoice={inv}
                      open={viewOpenForId === inv.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setViewOpenForId(inv.id);
                        } else {
                          setViewOpenForId(null);
                        }
                      }}
                      approvalLoadingId={approvalLoading}
                      onToggleApprove={handleApprovalToggle}
                      comments={invoiceComments}
                      commentsLoading={commentsLoading}
                      onAddComment={handleAddViewCommentText}
                      formatCurrency={formatCurrency}
                      formatDateTime={formatDateTime}
                      submittingComment={viewSubmitting}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadPdf(inv)}
                    >
                      PDF
                    </Button>
                    <InvoiceReportDialog
                      open={reportOpenForId === inv.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setReportOpenForId(inv.id);
                        } else {
                          setReportOpenForId(null);
                          setReportComments("");
                        }
                      }}
                      invoiceCode={inv.invoice_code}
                      comments={reportComments}
                      setComments={setReportComments}
                      onSubmit={handleSubmitReport}
                      submitting={reportLoading}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default InvoiceTable;

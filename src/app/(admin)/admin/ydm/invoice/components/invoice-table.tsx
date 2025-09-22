"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from "@/types/invoice";
import { Eye, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

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
  const [viewComment, setViewComment] = useState<string>("");
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

  const handleAddViewComment = async () => {
    if (!viewOpenForId) return;
    const trimmed = viewComment.trim();
    if (!trimmed) return;
    try {
      setViewSubmitting(true);
      await reportInvoice(viewOpenForId, trimmed);
      setViewComment("");
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
                      className={`text-xs font-medium ${getStatusColor(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{inv.is_approved ? "Yes" : "No"}</TableCell>
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
                  <TableCell className="whitespace-nowrap">
                    <Dialog
                      open={viewOpenForId === inv.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setViewOpenForId(inv.id);
                        } else {
                          setViewOpenForId(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View"
                          onClick={() => setViewOpenForId(inv.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Invoice
                            {/* Approval Button (only when not approved) */}
                            {!inv.is_approved ? (
                              <div className="mt-6 pt-6 border-t-2 border-gray-400 flex justify-end">
                                <div className="flex justify-center">
                                  <Button
                                    onClick={() =>
                                      handleApprovalToggle(
                                        inv.id,
                                        inv.is_approved
                                      )
                                    }
                                    disabled={approvalLoading === inv.id}
                                    className="min-w-32"
                                  >
                                    {approvalLoading === inv.id ? (
                                      <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Updating...
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        Approve
                                      </div>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : null}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                          <div className="border-b-4 border-black p-8">
                            <div className="flex justify-between items-start">
                              <div>
                                <h1 className="text-3xl font-bold text-black mb-2">
                                  YDM
                                </h1>
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
                                      {new Date(
                                        inv.created_at
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">
                                      Payment Type:
                                    </span>
                                    <span className="text-black font-bold">
                                      {inv.payment_type}
                                    </span>
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
                        {/* Comments Section + Add Comment */}
                        <div className="mt-6 border-t pt-4">
                          <h3 className="text-base font-semibold">Comments</h3>
                          {commentsLoading ? (
                            <div className="py-3 text-sm text-muted-foreground">
                              Loading comments...
                            </div>
                          ) : invoiceComments.length === 0 ? (
                            <div className="py-3 text-sm text-muted-foreground">
                              No comments for this invoice.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {invoiceComments.map((c) => (
                                <div
                                  key={c.id}
                                  className="p-3 border rounded-md bg-gray-50"
                                >
                                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {c.comment}
                                  </div>
                                  {c.created_at ? (
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {formatDateTime(c.created_at)}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add comment inline */}
                          <div className="mt-4 space-y-2">
                            <Textarea
                              placeholder="Write a comment..."
                              value={viewComment}
                              onChange={(e) => setViewComment(e.target.value)}
                              rows={3}
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={handleAddViewComment}
                                disabled={
                                  viewSubmitting ||
                                  viewComment.trim().length === 0
                                }
                              >
                                {viewSubmitting
                                  ? "Submitting..."
                                  : "Add Comment"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {/* Report Button and Dialog */}
                    <Dialog
                      open={reportOpenForId === inv.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setReportOpenForId(inv.id);
                        } else {
                          setReportOpenForId(null);
                          setReportComments("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="ml-1">
                          Comment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Comment Invoice</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Provide comments for commenting invoice{" "}
                            <span className="font-mono font-semibold">
                              {inv.invoice_code}
                            </span>
                            .
                          </p>
                          <Textarea
                            placeholder="Enter comments"
                            value={reportComments}
                            onChange={(e) => setReportComments(e.target.value)}
                            rows={4}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setReportOpenForId(null);
                                setReportComments("");
                              }}
                              disabled={reportLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSubmitReport}
                              disabled={
                                reportLoading ||
                                reportComments.trim().length === 0
                              }
                            >
                              {reportLoading
                                ? "Submitting..."
                                : "Submit Comment"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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

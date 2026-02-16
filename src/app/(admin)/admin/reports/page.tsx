"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Plus, FileText, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { Report, ReportsResponse } from "@/components/reports/types";
import { SalespersonFilter } from "@/components/salesperson/SalespersonFilter";
import { DateRange } from "react-day-picker";

const fetcher = (url: string): Promise<any> =>
    api.get(url).then((res): any => res.data);

export default function AdminReportsPage() {
    // const { toast } = useToast(); // Removed
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [page, setPage] = useState(1);

    const params = new URLSearchParams();
    params.append("page", page.toString());

    if (dateRange?.from) {
        params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
    }
    if (dateRange?.to) {
        params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
    } else if (dateRange?.from) {
        params.append("end_date", format(dateRange.from, "yyyy-MM-dd"));
    }

    const { data: reportsData, mutate, error, isLoading } = useSWR<ReportsResponse>(
        `/api/sales/reports/?${params.toString()}`,
        fetcher
    );

    const reports = reportsData?.results || [];
    const hasNext = !!reportsData?.next;
    const hasPrevious = !!reportsData?.previous;

    const handleOpenDialog = (report?: Report) => {
        setSelectedReport(report || null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this report?")) return;

        try {
            await api.delete(`/api/sales/reports/${id}/`);
            toast.success("Report deleted successfully");
            mutate();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete report");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data: Record<string, any> = {};

        // Convert empty strings to null for integer/decimal fields
        formData.forEach((value, key) => {
            if (value === "" && key !== 'remarks') {
                data[key] = null;
            } else if (key === 'remarks' && value === "") {
                data[key] = "";
            } else {
                data[key] = value;
            }
        });

        try {
            if (selectedReport) {
                await api.patch(`/api/sales/reports/${selectedReport.id}/`, data);
                toast.success("Report updated successfully");
            } else {
                await api.post("/api/sales/reports/", data);
                toast.success("Report created successfully");
            }
            setIsDialogOpen(false);
            mutate();
        } catch (error: any) {
            console.error("Submit error:", error);
            const errorMessage = error.response?.data?.detail || "Failed to save report";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-8 w-8 text-blue-600" />
                        Daily Reports
                    </h1>
                    <p className="text-gray-500 mt-1">Manage daily sales and activity reports.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Report
                </Button>
            </div>

            <SalespersonFilter
                dateRange={dateRange}
                setDateRange={setDateRange}
                showTimeframe={false}
            />

            <ReportsTable
                reports={reports}
                isLoading={isLoading}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
            />

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {reportsData?.count || 0} total reports
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!hasPrevious}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasNext}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedReport ? "Edit Report" : "Create New Report"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="daily_dollar_spending">Daily Ad Spend ($)</Label>
                                <Input
                                    id="daily_dollar_spending"
                                    name="daily_dollar_spending"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    defaultValue={selectedReport?.daily_dollar_spending ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message_received_fb">FB Messages</Label>
                                <Input
                                    id="message_received_fb"
                                    name="message_received_fb"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={selectedReport?.message_received_fb ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message_received_whatsapp">WhatsApp Messages</Label>
                                <Input
                                    id="message_received_whatsapp"
                                    name="message_received_whatsapp"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={selectedReport?.message_received_whatsapp ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message_received_tiktok">TikTok Messages</Label>
                                <Input
                                    id="message_received_tiktok"
                                    name="message_received_tiktok"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={selectedReport?.message_received_tiktok ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="call_received">Calls Received</Label>
                                <Input
                                    id="call_received"
                                    name="call_received"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={selectedReport?.call_received ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer_follow_up">Customer Follow-ups</Label>
                                <Input
                                    id="customer_follow_up"
                                    name="customer_follow_up"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={selectedReport?.customer_follow_up ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new_customer">New Customers</Label>
                                <Input
                                    id="new_customer"
                                    name="new_customer"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={selectedReport?.new_customer ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer_to_package">Customer to Package</Label>
                                <Input
                                    id="customer_to_package"
                                    name="customer_to_package"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={selectedReport?.customer_to_package ?? ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="free_treatment">Free Treatments</Label>
                                <Input
                                    id="free_treatment"
                                    name="free_treatment"
                                    type="number"
                                    placeholder="0"
                                    defaultValue={selectedReport?.free_treatment ?? ""}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                name="remarks"
                                placeholder="Any additional notes..."
                                className="resize-none min-h-[80px]"
                                defaultValue={selectedReport?.remarks ?? ""}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Report"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
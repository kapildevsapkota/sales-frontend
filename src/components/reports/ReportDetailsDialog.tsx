import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Report } from "./types";

interface ReportDetailsDialogProps {
    report: Report | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReportDetailsDialog({ report, open, onOpenChange }: ReportDetailsDialogProps) {
    if (!report) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Report Details</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-1 capitalize">
                            {report.franchise_name || "Report"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(report.created_at), "PPP p")}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">FB Messages</span>
                        <p className="font-medium">{report.message_received_fb ?? "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">WhatsApp Messages</span>
                        <p className="font-medium">{report.message_received_whatsapp ?? "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">TikTok Messages</span>
                        <p className="font-medium">{report.message_received_tiktok ?? "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Calls Received</span>
                        <p className="font-medium">{report.call_received ?? "-"}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Customer Follow-Up</span>
                        <p className="font-medium">{report.customer_follow_up ?? "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">New Customers</span>
                        <p className="font-medium">{report.new_customer ?? "-"}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Daily Dollar Spending</span>
                        <p className="font-medium text-green-600">{report.daily_dollar_spending ? `$${report.daily_dollar_spending}` : "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Customer To Package</span>
                        <p className="font-medium">{report.customer_to_package ?? "-"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Free Treatment</span>
                        <p className="font-medium">{report.free_treatment ?? "-"}</p>
                    </div>

                    {report.remarks && (
                        <div className="col-span-2 space-y-1 pt-2 border-t">
                            <span className="text-sm font-medium text-muted-foreground">Remarks</span>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.remarks}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

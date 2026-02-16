import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Report } from "./types";

interface ReportsTableProps {
    reports: Report[];
    isLoading?: boolean;
    showFranchise?: boolean;
    onEdit?: (report: Report) => void;
    onDelete?: (id: number) => void;
    onView?: (report: Report) => void;
}

export function ReportsTable({
    reports,
    isLoading,
    showFranchise = false,
    onEdit,
    onDelete,
    onView,
}: ReportsTableProps) {
    return (
        <div className="bg-white rounded-md border shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow
                    >
                        <TableHead className="w-[120px]">Date</TableHead>
                        {showFranchise && <TableHead>Franchise</TableHead>}
                        <TableHead>Facebook Msgs</TableHead>
                        <TableHead>Whatsapp Msgs</TableHead>
                        <TableHead>Tiktok Msgs</TableHead>
                        <TableHead>Calls Received</TableHead>
                        <TableHead>Customer Follow-up</TableHead>
                        <TableHead>Daily Dollar Spending ($)</TableHead>
                        <TableHead>New Customers</TableHead>
                        <TableHead>Customer To Packages</TableHead>
                        <TableHead>Free Treatment</TableHead>
                        <TableHead className="w-[200px]">Remarks</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell
                                colSpan={showFranchise ? 13 : 12}
                                className="h-24 text-center text-muted-foreground animate-pulse"
                            >
                                Loading reports...
                            </TableCell>
                        </TableRow>
                    ) : reports.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={showFranchise ? 13 : 12}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No reports found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        reports.map((report) => (
                            <TableRow
                                key={report.id}
                                className="hover:bg-gray-50/50 cursor-pointer"
                                onClick={() => {
                                    if (onView) onView(report);
                                    else if (onEdit) onEdit(report);
                                }}
                            >
                                <TableCell className="font-medium">
                                    {format(new Date(report.created_at), "MMM dd, yyyy")}
                                </TableCell>
                                {showFranchise && (
                                    <TableCell className="font-medium text-gray-600 capitalize">
                                        {report.franchise_name || "-"}
                                    </TableCell>
                                )}
                                <TableCell>{report.message_received_fb ?? "-"}</TableCell>
                                <TableCell>{report.message_received_whatsapp ?? "-"}</TableCell>
                                <TableCell>{report.message_received_tiktok ?? "-"}</TableCell>
                                <TableCell>{report.call_received ?? "-"}</TableCell>
                                <TableCell>{report.customer_follow_up ?? "-"}</TableCell>
                                <TableCell className="text-green-600 font-medium">
                                    {report.daily_dollar_spending ? `$${report.daily_dollar_spending}` : "-"}
                                </TableCell>
                                <TableCell>{report.new_customer ?? "-"}</TableCell>
                                <TableCell>{report.customer_to_package ?? "-"}</TableCell>
                                <TableCell>{report.free_treatment ?? "-"}</TableCell>
                                <TableCell className="text-gray-500 truncate max-w-[200px]" title={report.remarks || ""}>
                                    {report.remarks || "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                        {onView && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                                onClick={() => onView(report)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onEdit && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => onEdit(report)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => onDelete(report.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

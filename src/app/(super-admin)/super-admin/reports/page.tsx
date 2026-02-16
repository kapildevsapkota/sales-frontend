"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { ReportDetailsDialog } from "@/components/reports/ReportDetailsDialog";
import { Report, ReportsResponse } from "@/components/reports/types";
import { SalespersonFilter } from "@/components/salesperson/SalespersonFilter";
import { DateRange } from "react-day-picker";

interface Franchise {
    id: number;
    name: string;
}

const fetcher = (url: string): Promise<any> =>
    api.get(url).then((res): any => res.data);

export default function SuperAdminReportsPage() {
    // Filters

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("all");
    const [page, setPage] = useState(1);

    // Dialog state
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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

    if (selectedFranchiseId && selectedFranchiseId !== "all") {
        params.append("franchise", selectedFranchiseId);
    }

    const { data: reportsData, isLoading } = useSWR<ReportsResponse>(
        `/api/sales/reports/?${params.toString()}`,
        fetcher
    );

    const reports = reportsData?.results || [];
    const hasNext = !!reportsData?.next;
    const hasPrevious = !!reportsData?.previous;

    const { data: franchisesData } = useSWR<any>(
        "/api/account/my-franchises",
        fetcher
    );

    // Handle pagination/list structure of franchises if necessary
    const franchises: Franchise[] = Array.isArray(franchisesData)
        ? franchisesData
        : franchisesData?.results || [];

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-8 w-8 text-blue-600" />
                        Franchise Reports
                    </h1>
                    <p className="text-gray-500 mt-1">
                        View daily reports from all franchise locations.
                    </p>
                </div>
            </div>

            <Card className="shadow-none py-0 border-none">

                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <div className="space-y-2 min-w-[200px] w-full md:w-auto">
                            <Label htmlFor="franchise">Franchise</Label>
                            <Select
                                value={selectedFranchiseId}
                                onValueChange={setSelectedFranchiseId}
                            >
                                <SelectTrigger id="franchise">
                                    <SelectValue placeholder="All Franchises" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Franchises</SelectItem>
                                    {franchises.map((franchise) => (
                                        <SelectItem key={franchise.id} value={franchise.id.toString()}>
                                            {franchise.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 w-full md:w-auto pt-12">
                            <SalespersonFilter
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                                showTimeframe={false}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ReportsTable
                reports={reports}
                isLoading={isLoading}
                showFranchise={selectedFranchiseId === "all"}
                onView={handleViewReport}
            />

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {reportsData?.count || 0} total reports
                </div>
                <div className="space-x-2 flex items-center">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!hasPrevious}
                    >
                        <ChevronLeft className="h-4 w-4 " />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasNext}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 " />
                    </Button>

                </div>
            </div>

            <ReportDetailsDialog
                report={selectedReport}
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div >
    );
}
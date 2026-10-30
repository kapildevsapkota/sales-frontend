"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  OfflineAttendance,
  OfflineAttendanceResponse,
} from "@/types/offline-sales";
import { useDebounce } from "@/hooks/use-debounce";
import { AttendanceDetailsModal } from "./attendance-details-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  Search,
  Clock,
  MapPin,
  RefreshCw,
  Eye,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  Users,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export function OfflineAttendanceView() {
  const [attendanceList, setAttendanceList] = useState<OfflineAttendance[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [selectedDate, setSelectedDate] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedRecord, setSelectedRecord] =
    useState<OfflineAttendance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchAttendance = useCallback(
    async (pageToFetch = 1) => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query params
        const params: Record<string, string | number> = {
          page: pageToFetch,
          page_size: pageSize,
        };

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (selectedDate) {
          params.attendance_date = selectedDate;
        }

        // Call the requested endpoint: /api/offline-sales/attendance/
        let response;
        try {
          response = await api.get<OfflineAttendanceResponse>(
            "/api/offline-sales/attendance/",
            { params },
          );
        } catch (err: unknown) {
          if (
            isAxiosError(err) &&
            (err.response?.status === 404 || err.response?.status === 301)
          ) {
            response = await api.get<OfflineAttendanceResponse>(
              "/api/offline-sales/attendance",
              { params },
            );
          } else {
            throw err;
          }
        }

        const data = response.data;
        const results = Array.isArray(data) ? data : data?.results || [];
        const count =
          typeof data?.count === "number" ? data.count : results.length;

        setAttendanceList(results);
        setTotalCount(count);
        setCurrentPage(pageToFetch);
      } catch (err: unknown) {
        console.error("Failed to fetch offline attendance:", err);
        let errorMsg = "Failed to load attendance records.";
        if (isAxiosError<{ detail?: string; message?: string }>(err)) {
          errorMsg =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            err.message ||
            errorMsg;
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        setError(errorMsg);
        toast.error("Failed to fetch attendance logs");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, debouncedSearch, selectedDate],
  );

  useEffect(() => {
    fetchAttendance(1);
  }, [fetchAttendance]);

  // Derived KPI Stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCheckins = attendanceList.filter(
    (a) => a.attendance_date === todayStr,
  ).length;

  const uniqueStaff = new Set(attendanceList.map((a) => a.sales_person)).size;
  const uniqueLocations = new Set(
    attendanceList
      .map((a) => a.attendance_location)
      .filter((l) => Boolean(l) && l !== "—"),
  ).size;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleOpenDetails = (record: OfflineAttendance) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const formatTimeStr = (isoString: string) => {
    try {
      return format(new Date(isoString), "hh:mm a");
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Attendance Table Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by salesperson, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 h-10 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Input Filter */}
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-[160px] h-10 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-xs sm:text-sm"
              />
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate("")}
                  className="h-10 text-xs text-slate-500"
                >
                  Clear Date
                </Button>
              )}
            </div>

            {/* Page Size Select */}
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[110px] h-10 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-xs sm:text-sm">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchAttendance(currentPage)}
              disabled={isLoading}
              className="h-10 w-10 rounded-xl border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
              title="Refresh Attendance"
            >
              <RefreshCw
                className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-300 text-rose-700 hover:bg-rose-100"
              onClick={() => fetchAttendance(currentPage)}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-neutral-800/80 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4 text-center">Photo</th>
                  <th className="py-3.5 px-4">Salesperson</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">GPS Coordinates</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5 px-4 text-center">
                        <div className="h-10 w-10 bg-slate-200 dark:bg-neutral-800 rounded-xl mx-auto"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-32 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-5 w-16 bg-slate-200 dark:bg-neutral-800 rounded-full mx-auto"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-7 w-7 bg-slate-200 dark:bg-neutral-800 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : attendanceList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400">
                          <CalendarCheck className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          No attendance logs found
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {searchTerm || selectedDate
                            ? "Try adjusting your search query or selected date."
                            : "Attendance check-ins submitted by field staff will appear here."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  attendanceList.map((record) => {
                    const hasCoords =
                      Boolean(record.attendance_lat) &&
                      Boolean(record.attendance_long) &&
                      record.attendance_lat !== "0" &&
                      record.attendance_long !== "0";

                    return (
                      <tr
                        key={record.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                        onClick={() => handleOpenDetails(record)}
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4 text-center">
                          <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 mx-auto flex items-center justify-center shadow-sm flex-shrink-0">
                            {record.image ? (
                              <Image
                                src={record.image}
                                alt={record.sales_person_name}
                                width={40}
                                height={40}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </td>

                        {/* Salesperson */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {record.sales_person_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Agent ID: #{record.sales_person}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {record.attendance_date}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Clock className="h-3 w-3" />
                            {formatTimeStr(record.attendance_time)}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                            <span className="font-medium">
                              {record.attendance_location || "—"}
                            </span>
                          </span>
                        </td>

                        {/* Coordinates */}
                        <td
                          className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {hasCoords ? (
                            <a
                              href={`https://www.google.com/maps?q=${encodeURIComponent(
                                record.attendance_lat,
                              )},${encodeURIComponent(record.attendance_long)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-purple-600 hover:underline"
                            >
                              <span>
                                {record.attendance_lat},{" "}
                                {record.attendance_long}
                              </span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span>—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                            Present
                          </Badge>
                        </td>

                        {/* Action */}
                        <td
                          className="py-3.5 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg"
                            onClick={() => handleOpenDetails(record)}
                            title="View verification details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalCount}
            </span>{" "}
            attendance logs
          </div>

          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => fetchAttendance(1)}
              disabled={currentPage <= 1 || isLoading}
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Prev Page */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-lg px-2.5"
              onClick={() => fetchAttendance(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </Button>

            <span className="px-3 py-1 font-medium rounded-lg bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-lg px-2.5"
              onClick={() => fetchAttendance(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => fetchAttendance(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Details / Photo Modal */}
      <AttendanceDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
}

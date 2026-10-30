"use client";

import { useState } from "react";
import { OfflineAttendance } from "@/types/offline-sales";
import { Card, CardContent } from "@/components/ui/card";
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
  CheckCircle,
  UserX,
  Navigation,
} from "lucide-react";

const INITIAL_ATTENDANCE: OfflineAttendance[] = [
  {
    id: 1,
    sales_person_id: 238,
    sales_person_name: "offline (Agent 238)",
    franchise_name: "Test Franchises",
    phone: "9841000111",
    date: "2026-10-30",
    check_in_time: "09:15 AM",
    check_out_time: null,
    status: "On Field",
    working_hours: "3 hrs 20 mins",
    location: "Kathmandu Central Market",
    remarks: "Visiting store clients for order collection",
  },
  {
    id: 2,
    sales_person_id: 240,
    sales_person_name: "Ramesh Adhikari",
    franchise_name: "Test Franchises",
    phone: "9841555666",
    date: "2026-10-30",
    check_in_time: "09:00 AM",
    check_out_time: null,
    status: "Present",
    working_hours: "3 hrs 35 mins",
    location: "Franchise Office",
    remarks: "Preparing promotional packages",
  },
  {
    id: 3,
    sales_person_id: 245,
    sales_person_name: "Sunil Shrestha",
    franchise_name: "Eastern Hub",
    phone: "9841888999",
    date: "2026-10-30",
    check_in_time: "10:10 AM",
    check_out_time: null,
    status: "Late",
    working_hours: "2 hrs 25 mins",
    location: "Biratnagar Bazaar",
    remarks: "Delayed due to client follow-up call",
  },
  {
    id: 4,
    sales_person_id: 250,
    sales_person_name: "Pooja Gurung",
    franchise_name: "Pokhara Branch",
    phone: "9841777333",
    date: "2026-10-30",
    check_in_time: null,
    check_out_time: null,
    status: "Absent",
    working_hours: "0 hrs",
    location: "—",
    remarks: "Sick leave approved",
  },
];

export function OfflineAttendanceView() {
  const [attendanceList] = useState<OfflineAttendance[]>(INITIAL_ATTENDANCE);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAttendance = attendanceList.filter((item) => {
    const matchesSearch =
      item.sales_person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.franchise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAgents = attendanceList.length;
  const onField = attendanceList.filter((a) => a.status === "On Field").length;
  const present = attendanceList.filter(
    (a) => a.status === "Present" || a.status === "On Field" || a.status === "Late"
  ).length;
  const absent = attendanceList.filter((a) => a.status === "Absent").length;

  const getStatusBadge = (status: OfflineAttendance["status"]) => {
    switch (status) {
      case "Present":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
            Present
          </Badge>
        );
      case "On Field":
        return (
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300">
            On Field
          </Badge>
        );
      case "Late":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
            Late
          </Badge>
        );
      case "Absent":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
            Absent
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Field Staff
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {totalAgents}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Assigned offline salespeople
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Today
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {present}
              </h3>
              <p className="text-[11px] text-emerald-600/70 mt-0.5">
                Checked-in staff members
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Currently On Field
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {onField}
              </h3>
              <p className="text-[11px] text-indigo-600/70 mt-0.5">
                Client store visits in progress
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Navigation className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Absent / On Leave
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {absent}
              </h3>
              <p className="text-[11px] text-rose-600/70 mt-0.5">
                Unmarked or leave records
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <UserX className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search staff, franchise, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-xs sm:text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="On Field">On Field</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-neutral-800/80 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Salesperson</th>
                  <th className="py-3.5 px-4">Franchise</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Check-In</th>
                  <th className="py-3.5 px-4">Check-Out</th>
                  <th className="py-3.5 px-4 text-center">Working Hours</th>
                  <th className="py-3.5 px-4">Current Location</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400 text-xs">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {record.sales_person_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {record.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                        {record.franchise_name}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {record.date}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-900 dark:text-white">
                        {record.check_in_time ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <Clock className="h-3 w-3" />
                            {record.check_in_time}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-900 dark:text-white">
                        {record.check_out_time ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {record.check_out_time}
                          </span>
                        ) : (
                          <span className="text-slate-400">In Progress</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {record.working_hours || "—"}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {record.location !== "—" ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-purple-600" />
                            {record.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(record.status)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 italic max-w-xs truncate">
                        {record.remarks || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

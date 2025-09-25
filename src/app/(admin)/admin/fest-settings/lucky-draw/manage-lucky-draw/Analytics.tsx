"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnalyticsProps {
  luckyDrawId: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ luckyDrawId }) => {
  interface GiftItem {
    id: number;
    name: string;
    image: string;
    category: string;
    lucky_draw_system: number;
  }

  interface AnalyticsItem {
    full_name: string;
    gift: GiftItem[];
    prize_details?: string;
    date_of_purchase: string;
  }

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);

  const fetchAnalytics = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/slot-machine/?lucky_draw_system_id=${luckyDrawId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    const data = (await response.json()) as AnalyticsItem[];
    setAnalytics(data ?? []);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  console.log(analytics);

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/export-detail/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate,
            lucky_draw_system_id: luckyDrawId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the filename from the Content-Disposition header, or use a default name
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = contentDisposition
        ? filenameRegex.exec(contentDisposition)
        : null;
      const filename =
        matches && matches[1]
          ? matches[1].replace(/['"]/g, "")
          : startDate + " to " + endDate + " - " + luckyDrawId + ".csv";

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger the download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-sm font-medium text-gray-700"
              >
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-sm font-medium text-gray-700"
              >
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Export CSV
            </Button>
          </div>

          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full name</TableHead>
                  <TableHead>Gift</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((row, idx) => {
                  const giftText =
                    row.gift && row.gift.length > 0
                      ? row.gift.map((g) => g.name).join(", ")
                      : "No gift";
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {row.full_name}
                      </TableCell>
                      <TableCell>{giftText}</TableCell>
                      <TableCell className="text-right">
                        {row.date_of_purchase}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {analytics.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Analytics;

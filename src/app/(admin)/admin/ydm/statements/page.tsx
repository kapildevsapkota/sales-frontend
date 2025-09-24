"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import StatementView from "@/components/ydm/statement/statement-view";
import { useStatements } from "@/hooks/use-statements";
import { useAuth } from "@/contexts/AuthContext";

export default function StatementPage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);

  const { data, isLoading, error } = useStatements(
    user?.franchise_id as unknown as string,
    currentPage,
    pageSize
  );

  const totalCount = data?.count ?? 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  if (isLoading && !data) return <div>Loading statements...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-4 mt-8 mx-auto max-w-7xl">
      <div className="grid grid-cols-7 gap-4 sm:gap-6">
        {(() => {
          const breakdown = data.results.dashboard_breakdown;
          const items = [
            {
              key: "total_order",
              name: "Total Order",
              value: breakdown.total_order,
            },
            {
              key: "total_amount",
              name: "Total Amount",
              value: `Nrs. ${breakdown.total_amount}`,
            },
            {
              key: "cancelled_count",
              name: "Cancelled Count",
              value: breakdown.cancelled_count,
            },
            {
              key: "delivered_count",
              name: "Delivered Count",
              value: breakdown.delivered_count,
            },
            {
              key: "delivered_amount",
              name: "Delivered Amount",
              value: `Nrs. ${breakdown.delivered_amount}`,
            },
            {
              key: "total_charge",
              name: "Total Charge",
              value: `Nrs. ${breakdown.total_charge}`,
            },
            {
              key: "approved_paid",
              name: "Received Amount",
              value: `Nrs. ${breakdown.approved_paid}`,
            },
          ];
          return items.map((item) => (
            <Card
              key={item.key}
              className="bg-amber-500 text-white shadow-none border-0 rounded-xl p-4"
            >
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-bold text-white/90 leading-tight">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-md text-white">
                  {(() => {
                    const formatNepalAmount = (value: string | number) => {
                      // If value already contains "Nrs.", extract just the number part
                      if (typeof value === "string" && value.includes("Nrs.")) {
                        const numPart = value.replace("Nrs. ", "");
                        const num = parseInt(numPart);
                        if (!num || num < 1000) return value;

                        // Format the number part
                        const str = num.toString();
                        const reversed = str.split("").reverse();
                        let formatted = "";

                        for (let i = 0; i < reversed.length; i++) {
                          if (i === 3) {
                            formatted = "," + formatted;
                          } else if (i > 3 && (i - 3) % 2 === 0) {
                            formatted = "," + formatted;
                          }
                          formatted = reversed[i] + formatted;
                        }

                        return `Nrs. ${formatted}`;
                      }

                      // If it's just a number, format it
                      const num = parseInt(value.toString());
                      if (!num || num < 1000) return value?.toString() || "0";

                      const str = num.toString();
                      const reversed = str.split("").reverse();
                      let formatted = "";

                      for (let i = 0; i < reversed.length; i++) {
                        if (i === 3) {
                          formatted = "," + formatted;
                        } else if (i > 3 && (i - 3) % 2 === 0) {
                          formatted = "," + formatted;
                        }
                        formatted = reversed[i] + formatted;
                      }

                      return formatted;
                    };
                    return formatNepalAmount(item.value as string | number);
                  })()}
                </div>
              </CardContent>
            </Card>
          ));
        })()}
      </div>

      <StatementView data={data.results} />

      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-between py-3 border-t">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalCount} total days)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

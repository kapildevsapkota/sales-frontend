import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FranchiseStatsEntry } from "./types";
import { calcTrend, formatCurrency, formatNumber } from "./utils";

interface FranchiseLeaderboardProps {
  entries: FranchiseStatsEntry[];
  loading: boolean;
  totalRevenue: number;
  onSelectFranchise: () => void;
}

export function FranchiseLeaderboard({
  entries,
  loading,
  totalRevenue,
  onSelectFranchise,
}: FranchiseLeaderboardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
          Franchise Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Today&apos;s sales ranked across all franchises
        </p>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            No franchise data available.
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="space-y-2 md:hidden">
              {entries.map((entry, idx) => {
                const share =
                  totalRevenue > 0
                    ? (entry.statistics.total_sales / totalRevenue) * 100
                    : 0;

                return (
                  <button
                    key={entry.franchise.id}
                    type="button"
                    onClick={onSelectFranchise}
                    className="w-full rounded-lg border p-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">#{idx + 1}</p>
                        <p className="font-medium truncate">{entry.franchise.name}</p>
                        {entry.franchise.short_form && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.franchise.short_form}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-primary shrink-0 text-sm">
                        {formatCurrency(entry.statistics.total_sales)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatNumber(entry.statistics.total_orders)} orders</span>
                      <span>{share.toFixed(1)}% share</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Franchise</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right w-32">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry, idx) => {
                    const share =
                      totalRevenue > 0
                        ? (entry.statistics.total_sales / totalRevenue) * 100
                        : 0;
                    const ordersTrend = calcTrend(
                      entry.statistics.total_orders,
                      entry.statistics.total_orders_yesterday,
                    );

                    return (
                      <TableRow
                        key={entry.franchise.id}
                        className="cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={onSelectFranchise}
                      >
                        <TableCell className="font-medium text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{entry.franchise.name}</div>
                          {entry.franchise.short_form && (
                            <div className="text-xs text-muted-foreground">
                              {entry.franchise.short_form}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">
                            {formatNumber(entry.statistics.total_orders)}
                          </div>
                          <div
                            className={`text-xs ${
                              ordersTrend >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {ordersTrend >= 0 ? "+" : ""}
                            {ordersTrend.toFixed(0)}% vs yesterday
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {formatCurrency(entry.statistics.total_sales)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-medium">
                              {share.toFixed(1)}%
                            </span>
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary/70"
                                style={{ width: `${Math.min(share, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

import { Building2, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { RankBadge } from "./rank-badge";
import {
  FestGroup,
  FranchiseSalesEntry,
  RankedSalesperson,
} from "./types";
import {
  formatCurrency,
  formatNumber,
  getFranchiseSalesAmount,
  sortSalespersonsByAmount,
} from "./utils";

interface GroupRankingsPanelProps {
  title: string;
  description: string;
  group: FestGroup;
  franchiseEntries: FranchiseSalesEntry[];
  salespersons: RankedSalesperson[];
  loading: boolean;
}

export function GroupRankingsPanel({
  title,
  description,
  group,
  franchiseEntries,
  salespersons,
  loading,
}: GroupRankingsPanelProps) {
  const rankedFranchises = [...franchiseEntries].sort(
    (a, b) => getFranchiseSalesAmount(b) - getFranchiseSalesAmount(a),
  );
  const rankedSalespersons: RankedSalesperson[] =
    sortSalespersonsByAmount(salespersons);
  const totalGroupRevenue = rankedFranchises.reduce(
    (sum, entry) => sum + getFranchiseSalesAmount(entry),
    0,
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
        {!loading && (
          <p className="text-sm font-semibold text-primary">
            Group total: {formatCurrency(totalGroupRevenue)}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6 px-3 sm:px-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                Franchise Rankings
              </h3>
              {rankedFranchises.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No franchise data in this group.
                </p>
              ) : (
                <>
                  <div className="space-y-2 md:hidden">
                    {rankedFranchises.map((entry, idx) => {
                      const revenue = getFranchiseSalesAmount(entry);
                      const orders = entry.salespersons.reduce(
                        (sum, sp) => sum + sp.sales_count,
                        0,
                      );

                      return (
                        <div
                          key={entry.franchise.id}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <RankBadge rank={idx + 1} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate text-sm">
                              {entry.franchise.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(orders)} orders
                            </p>
                          </div>
                          <p className="font-semibold text-primary text-sm shrink-0">
                            {formatCurrency(revenue)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden md:block rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Franchise</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rankedFranchises.map((entry, idx) => {
                          const revenue = getFranchiseSalesAmount(entry);
                          const orders = entry.salespersons.reduce(
                            (sum, sp) => sum + sp.sales_count,
                            0,
                          );

                          return (
                            <TableRow key={entry.franchise.id}>
                              <TableCell>
                                <RankBadge rank={idx + 1} />
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {entry.franchise.name}
                                </div>
                                {entry.franchise.short_form && (
                                  <div className="text-xs text-muted-foreground">
                                    {entry.franchise.short_form}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatNumber(orders)}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-primary">
                                {formatCurrency(revenue)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary shrink-0" />
                Salesperson Rankings {group}
              </h3>
              {rankedSalespersons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No salesperson data in this group.
                </p>
              ) : (
                <>
                  <div className="space-y-2 md:hidden">
                    {rankedSalespersons.map((sp, idx) => (
                      <div
                        key={`${sp.franchiseName}-${sp.first_name}-${sp.last_name}-${idx}`}
                        className="rounded-lg border p-3 space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          <RankBadge rank={idx + 1} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">
                              {sp.first_name} {sp.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {sp.franchiseName}
                            </p>
                          </div>
                          <p className="font-semibold text-primary text-sm shrink-0">
                            {formatCurrency(sp.total_sales)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs pl-10">
                          <Badge
                            variant="outline"
                            className={
                              sp.group === "A"
                                ? "border-amber-300 text-amber-800 bg-amber-50"
                                : "border-blue-300 text-blue-800 bg-blue-50"
                            }
                          >
                            Group {sp.group}
                          </Badge>
                          <span className="text-muted-foreground">
                            {formatNumber(sp.sales_count)} orders
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40">
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Salesperson</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Franchise</TableHead>
                          <TableHead className="text-right">Orders</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rankedSalespersons.map((sp, idx) => (
                          <TableRow
                            key={`${sp.franchiseName}-${sp.first_name}-${sp.last_name}-${idx}`}
                          >
                            <TableCell>
                              <RankBadge rank={idx + 1} />
                            </TableCell>
                            <TableCell className="font-medium">
                              {sp.first_name} {sp.last_name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  sp.group === "A"
                                    ? "border-amber-300 text-amber-800 bg-amber-50"
                                    : "border-blue-300 text-blue-800 bg-blue-50"
                                }
                              >
                                Group {sp.group}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {sp.franchiseName}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(sp.sales_count)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {formatCurrency(sp.total_sales)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}

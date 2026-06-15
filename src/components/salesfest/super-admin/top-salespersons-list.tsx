import { Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RANK_STYLES } from "./constants";
import { RankBadge } from "./rank-badge";
import { Salesperson } from "./types";
import { formatCurrency, sortSalespersonsByAmount } from "./utils";

interface TopSalespersonsListProps {
  salespersons: Salesperson[];
  loading: boolean;
  subtitle: string;
}

export function TopSalespersonsList({
  salespersons,
  loading,
  subtitle,
}: TopSalespersonsListProps) {
  const rankedSalespersons = sortSalespersonsByAmount(salespersons);

  return (
    <Card className="shadow-sm">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="h-5 w-5 text-primary shrink-0" />
          Top Salespersons
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : rankedSalespersons.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No salesperson data found for this period.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {rankedSalespersons.map((sp, idx) => (
              <AccordionItem
                key={`${sp.first_name}-${sp.last_name}-${idx}`}
                value={`${sp.first_name}-${sp.last_name}-${idx}`}
                className={`rounded-xl border px-3 sm:px-4 ${
                  idx < 3 ? RANK_STYLES[idx] : "bg-white"
                }`}
              >
                <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                  <div className="flex w-full items-center justify-between gap-2 sm:gap-4 pr-1 sm:pr-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <RankBadge rank={idx + 1} size="sm" />
                      <div className="text-left min-w-0">
                        <p className="font-semibold truncate text-sm sm:text-base">
                          {sp.first_name} {sp.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sp.sales_count} order
                          {sp.sales_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm sm:text-base">
                        {formatCurrency(sp.total_sales)}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground">
                        {sp.product_sales.length} product
                        {sp.product_sales.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto pb-2 -mx-1 px-1">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-2 pr-4 font-medium">
                            Product
                          </th>
                          <th className="text-right py-2 font-medium">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sp.product_sales.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="py-3 text-muted-foreground">
                              No product sales
                            </td>
                          </tr>
                        ) : (
                          sp.product_sales.map((product, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-2 pr-4">{product.product_name}</td>
                              <td className="py-2 text-right font-medium">
                                {product.quantity_sold}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

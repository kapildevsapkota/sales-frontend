import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Franchise, FranchiseSalesEntry } from "./types";
import { formatCurrency, formatNumber } from "./utils";

interface FranchiseSalesGridProps {
  entries: FranchiseSalesEntry[];
  loading: boolean;
  filterLabel: string;
  onFranchiseSelect: (franchise: Franchise) => void;
}

export function FranchiseSalesGrid({
  entries,
  loading,
  filterLabel,
  onFranchiseSelect,
}: FranchiseSalesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground text-sm">
          No franchise data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {entries.map((entry) => (
        <div
          key={entry.franchise.id}
          className="bg-white rounded-xl shadow-sm p-3 h-fit border min-w-0"
        >
          <button
            type="button"
            onClick={() => onFranchiseSelect(entry.franchise)}
            className="mb-3 w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-left transition-colors hover:from-blue-100 hover:to-indigo-100"
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate">
              {entry.franchise.name}
            </h3>
            {entry.franchise.short_form && (
              <p className="text-xs text-muted-foreground mb-2 truncate">
                {entry.franchise.short_form}
              </p>
            )}
            {entry.statistics ? (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-semibold">
                  {formatNumber(entry.statistics.total_orders)} orders
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                  {formatCurrency(entry.statistics.total_sales)}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Stats unavailable</p>
            )}
            <p className="text-[11px] text-primary font-medium mt-2">
              Tap to view orders
            </p>
          </button>

          <p className="text-xs text-muted-foreground mb-3 px-1">
            {filterLabel} · Top salespersons
          </p>

          <Accordion type="single" collapsible className="w-full">
            {entry.salespersons.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-sm">
                No sales data found for this franchise.
              </div>
            ) : (
              entry.salespersons.map((sp, idx) => (
                <AccordionItem
                  key={idx}
                  value={`${entry.franchise.id}-${sp.first_name}-${sp.last_name}-${idx}`}
                >
                  <AccordionTrigger className="text-xs hover:no-underline py-2">
                    <div className="flex w-full items-center justify-between gap-2 pr-2">
                      <span className="font-medium text-left truncate">
                        {sp.first_name} {sp.last_name}
                      </span>
                      <span className="font-semibold text-primary shrink-0">
                        {formatCurrency(sp.total_sales)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1 px-1">Product</th>
                            <th className="text-right py-1 px-1">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sp.product_sales.length === 0 ? (
                            <tr>
                              <td colSpan={2} className="py-1 px-1 text-gray-400">
                                No product sales
                              </td>
                            </tr>
                          ) : (
                            sp.product_sales.map((ps, i) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-1 px-1">{ps.product_name}</td>
                                <td className="py-1 px-1 text-right">
                                  {ps.quantity_sold}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </div>
      ))}
    </div>
  );
}

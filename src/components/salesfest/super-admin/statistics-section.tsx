import { DollarSign, ShoppingCart } from "lucide-react";
import { Statistics } from "@/components/dashboard/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "./stat-card";
import { calcTrend, formatCurrency, formatNumber } from "./utils";

function StatsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface StatisticsSectionProps {
  statistics?: Statistics;
  loading: boolean;
}

export function StatisticsSection({
  statistics,
  loading,
}: StatisticsSectionProps) {
  if (loading) return <StatsSkeleton />;
  if (!statistics) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Unable to load statistics.
        </CardContent>
      </Card>
    );
  }

  const salesTrend = calcTrend(
    statistics.total_sales,
    statistics.total_sales_yesterday,
  );
  const ordersTrend = calcTrend(
    statistics.total_orders,
    statistics.total_orders_yesterday,
  );

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <StatCard
        label="Revenue Today"
        sublabel={statistics.date}
        value={formatCurrency(statistics.total_sales)}
        icon={<DollarSign className="h-4 w-4 text-green-600" />}
        trend={{ value: salesTrend, label: "vs yesterday" }}
        footer={`Yesterday: ${formatCurrency(statistics.total_sales_yesterday)}`}
        className="border-green-100"
      />
      <StatCard
        label="Orders Today"
        sublabel={statistics.date}
        value={formatNumber(statistics.total_orders)}
        icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
        trend={{ value: ordersTrend, label: "vs yesterday" }}
        footer={`Yesterday: ${formatNumber(statistics.total_orders_yesterday)} orders`}
        className="border-blue-100"
      />
    </div>
  );
}

import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  footer?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  trend,
  footer,
  className,
}: StatCardProps) {
  const isPositive = trend ? trend.value >= 0 : undefined;

  return (
    <Card className={`shadow-sm border ${className ?? ""}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {sublabel}
            </p>
          )}
        </div>
        <div className="rounded-full bg-muted p-2 shrink-0">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold tracking-tight">{value}</div>
        {trend && (
          <div className="flex flex-wrap items-center gap-1 mt-2 text-xs">
            {isPositive ? (
              <ArrowUp className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-600" />
            )}
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {footer && (
          <p className="text-xs text-muted-foreground mt-2">{footer}</p>
        )}
      </CardContent>
    </Card>
  );
}

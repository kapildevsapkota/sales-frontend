import { Store, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SalesFestHeaderProps {
  franchiseCount: number;
}

export function SalesFestHeader({ franchiseCount }: SalesFestHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-amber-500 shrink-0" />
          <span className="truncate">Sales Fest</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overall network performance and franchise-wise breakdown
        </p>
      </div>
      <Badge variant="secondary" className="w-fit text-sm px-3 py-1 shrink-0">
        <Store className="h-3.5 w-3.5 mr-1.5" />
        {franchiseCount} franchise{franchiseCount !== 1 ? "s" : ""}
      </Badge>
    </div>
  );
}

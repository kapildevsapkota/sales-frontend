import { TableCell, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export function CityTableSkeleton() {
  return (
    <TableRow>
      <TableCell colSpan={3} className="h-24">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </TableCell>
    </TableRow>
  );
}

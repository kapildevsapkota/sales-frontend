import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function RentalTableSkeleton() {
  return (
    <>
      {[...Array(10)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-6 w-[250px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-[50px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-[50px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-[100px]" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-[70px]" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

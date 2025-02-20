"use client";

import { TableCell, TableRow } from "@/components/ui/table";

export function FactoryTableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="h-6 w-[250px] animate-pulse rounded bg-muted"></div>
          </TableCell>
          <TableCell>
            <div className="h-6 w-[150px] animate-pulse rounded bg-muted"></div>
          </TableCell>
          <TableCell>
            <div className="h-6 w-[100px] animate-pulse rounded bg-muted"></div>
          </TableCell>
          <TableCell>
            <div className="flex justify-end">
              <div className="h-8 w-[70px] animate-pulse rounded bg-muted"></div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

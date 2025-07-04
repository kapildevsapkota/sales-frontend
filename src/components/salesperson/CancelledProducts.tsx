"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface ProductSale {
  product_name: string;
  quantity_sold: number;
}

interface CancelledProductsProps {
  product_sales: ProductSale[];
  dateRange: DateRange | undefined;
}

export function CancelledProducts({
  product_sales,
  dateRange,
}: CancelledProductsProps) {
  return (
    <div className="space-y-4 w-full mt-5">
      <div className="flex items-center py-2 gap-2">
        <div className="text-lg font-semibold text-gray-900">
          Cancelled Products
        </div>
        <div className="text-sm text-gray-500">
          {dateRange?.from &&
            (dateRange.to
              ? `(${format(dateRange.from, "MMM d")} - ${format(
                  dateRange.to,
                  "MMM d, yyyy"
                )})`
              : `(${format(dateRange.from, "MMM d, yyyy")})`)}
        </div>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <Table className="h-[150px]">
          <TableHeader>
            <TableRow className="bg-red-600 hover:bg-red-600 cursor-default">
              <TableHead className="w-[50px] text-white">#</TableHead>
              <TableHead className="text-white">Product Name</TableHead>
              <TableHead className="text-center text-white">
                Quantity Cancelled
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product_sales.length > 0 ? (
              product_sales.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {product.product_name}
                  </TableCell>
                  <TableCell className="text-center text-red-600">
                    {product.quantity_sold}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No cancelled products recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

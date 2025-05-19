"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Timeframe } from "@/components/dashboard/types";
import { format } from "date-fns";

interface ProductSale {
  product_name: string;
  quantity_sold: number;
}

interface ProductsSoldProps {
  product_sales: ProductSale[];
  timeframe: Timeframe;
  date: Date | undefined;
}

export function ProductsSold({
  product_sales,
  timeframe,
  date,
}: ProductsSoldProps) {
  return (
    <div className="space-y-4 w-full mt-5">
      <div className="flex items-center py-2 gap-2">
        <div className="text-lg font-semibold text-gray-900">Products Sold</div>
        <div className="text-sm text-gray-500">
          {timeframe} {date && `(${format(date, "MMM d, yyyy")})`}
        </div>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <Table className="h-[150px]">
          <TableHeader>
            <TableRow className="bg-black hover:bg-black cursor-default">
              <TableHead className="w-[50px] text-white">#</TableHead>
              <TableHead className="text-white">Product Name</TableHead>
              <TableHead className="text-center text-white">
                Quantity Sold
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
                  <TableCell className="text-center">
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
                  No product sales recorded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

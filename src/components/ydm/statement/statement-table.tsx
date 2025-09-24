import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatementApiResponse } from "@/types/statements";

type Props = {
  data: StatementApiResponse;
};

const DeliveryTable: React.FC<Props> = ({ data }) => {
  const records = React.useMemo(
    () =>
      [...data.statement].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [data.statement]
  );

  return (
    <div className="space-y-4 mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Statement Records</h2>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Total Orders</TableHead>
              <TableHead className="font-semibold">Total Amount</TableHead>
              <TableHead className="font-semibold">Delivery Count</TableHead>
              <TableHead className="font-semibold">Delivered Amount</TableHead>
              <TableHead className="font-semibold">Delivery Charge</TableHead>
              <TableHead className="font-semibold">Payment</TableHead>
              <TableHead className="font-semibold">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((row) => (
              <TableRow
                key={row.date}
                className="border-gray-50 hover:bg-gray-50/50"
              >
                <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                <TableCell>{row.total_order}</TableCell>
                <TableCell>{row.total_amount}</TableCell>
                <TableCell>{row.delivery_count}</TableCell>
                <TableCell className="font-medium">
                  {Number(row.cash_in).toLocaleString()}
                </TableCell>
                <TableCell>
                  {Number(row.delivery_charge).toLocaleString()}
                </TableCell>
                <TableCell>{Number(row.payment).toLocaleString()}</TableCell>
                <TableCell className="font-medium">
                  {Number(row.balance).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DeliveryTable;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Entry {
  id: number;
  customerName: string;
  phoneNumber: string;
  imei: string;
  dateOfPurchase: string;
  prize: string;
}

interface EntriesProps {
  luckyDrawId: number | undefined;
}

const Entries: React.FC<EntriesProps> = ({ luckyDrawId }) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    // Fetch entries
    setEntries([
      {
        id: 1,
        customerName: "John Doe",
        phoneNumber: "1234567890",
        imei: "123456789012345",
        dateOfPurchase: "2023-06-05",
        prize: "Smartphone",
      },
      {
        id: 2,
        customerName: "Jane Smith",
        phoneNumber: "0987654321",
        imei: "987654321098765",
        dateOfPurchase: "2023-06-06",
        prize: "Pending",
      },
    ]);
  }, [luckyDrawId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>IMEI</TableHead>
              <TableHead>Date of Purchase</TableHead>
              <TableHead>Prize</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.customerName}</TableCell>
                <TableCell>{entry.phoneNumber}</TableCell>
                <TableCell>{entry.imei}</TableCell>
                <TableCell>{entry.dateOfPurchase}</TableCell>
                <TableCell>{entry.prize}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Entries;

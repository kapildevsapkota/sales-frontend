"use client";

import { format } from "date-fns";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GameWinner } from "@/types/game";

interface WinnersTableProps {
  winners: GameWinner[];
  loading: boolean;
}

export function WinnersTable({ winners, loading }: WinnersTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading winners...
        </CardContent>
      </Card>
    );
  }

  if (winners.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium text-muted-foreground">No winners yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Winners appear here when orders satisfy the active challenge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Winners ({winners.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Sales Person</TableHead>
                <TableHead>Franchise</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Won At</TableHead>
                <TableHead>Notified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((winner) => (
                <TableRow key={winner.id}>
                  <TableCell className="font-medium">
                    {winner.order_code}
                  </TableCell>
                  <TableCell>{winner.customer_name}</TableCell>
                  <TableCell>{winner.sales_person_name || "-"}</TableCell>
                  <TableCell>{winner.franchise_name || "-"}</TableCell>
                  <TableCell>{winner.game_name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {winner.condition_name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(winner.won_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={winner.notified ? "default" : "secondary"}>
                      {winner.notified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden divide-y">
          {winners.map((winner) => (
            <div key={winner.id} className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{winner.order_code}</p>
                  <p className="text-sm text-muted-foreground">
                    {winner.customer_name}
                  </p>
                </div>
                <Badge variant={winner.notified ? "default" : "secondary"}>
                  {winner.notified ? "Notified" : "Pending"}
                </Badge>
              </div>
              <p className="text-sm">
                <span className="font-medium">Sales Person:</span>{" "}
                {winner.sales_person_name || "-"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Franchise:</span>{" "}
                {winner.franchise_name || "-"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Game:</span> {winner.game_name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Condition:</span>{" "}
                {winner.condition_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(winner.won_at), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

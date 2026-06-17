"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Trophy } from "lucide-react";
import type { GameWinner } from "@/types/game";

interface GameWinnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  winner: GameWinner | null;
}

export function GameWinnerDialog({
  open,
  onOpenChange,
  winner,
}: GameWinnerDialogProps) {
  if (!winner) return null;

  const wonAt = format(new Date(winner.won_at), "MMM d, yyyy 'at' h:mm a");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 px-6 pt-8 pb-6 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-bold text-white">
              We have a winner!
            </DialogTitle>
            <DialogDescription className="text-amber-50 text-sm sm:text-base">
              {winner.game_name} challenge completed
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <PartyPopper className="h-4 w-4 shrink-0" />
              <span>{winner.customer_name}</span>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Order</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {winner.order_code}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Challenge</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {winner.condition_name}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Won at</dt>
                <dd className="text-gray-700 text-right">{wonAt}</dd>
              </div>
            </dl>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 sm:justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

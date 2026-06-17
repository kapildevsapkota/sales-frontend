"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";
import type { WonGame } from "@/types/game";

interface GameWinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wonGame: WonGame | null;
  orderCode?: string;
}

export function GameWinDialog({
  open,
  onOpenChange,
  wonGame,
  orderCode,
}: GameWinDialogProps) {
  if (!wonGame) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
        <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 px-6 pt-8 pb-6 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-bold text-white">
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-amber-50 text-sm sm:text-base">
              {orderCode ? `Order ${orderCode} won the challenge` : "Order won the challenge"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border bg-amber-50/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{wonGame.game_name}</span>
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Condition:</span>{" "}
              {wonGame.condition_name}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {wonGame.message}
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 sm:justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy } from "lucide-react";
import type { ActiveGame } from "@/types/game";

interface ActiveGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: ActiveGame | null;
}

function formatRuleLabel(
  rule: ActiveGame["conditions"][0]["rules"][0],
): string {
  if (rule.rule_type === "product") {
    return `${rule.min_quantity}x ${rule.product_name ?? `Product #${rule.product}`}`;
  }
  return `${rule.min_quantity}x "${rule.keyword}"`;
}

export function ActiveGameDialog({
  open,
  onOpenChange,
  game,
}: ActiveGameDialogProps) {
  if (!game) return null;

  const activeCondition = game.conditions.find(
    (condition) => condition.id === game.active_condition,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 px-6 pt-8 pb-6 text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Gamepad2 className="h-8 w-8 text-white" />
          </div>
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-bold text-white">
              {game.name}
            </DialogTitle>
            <DialogDescription className="text-purple-100 text-sm sm:text-base">
              {game.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          {game.active_condition_name ? (
            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-purple-800 font-semibold">
                <Trophy className="h-4 w-4 shrink-0" />
                <span>Today&apos;s Challenge</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {game.active_condition_name}
              </p>
              {activeCondition && (
                <div className="flex flex-wrap gap-2">
                  {activeCondition.rules.map((rule) => (
                    <Badge
                      key={rule.id}
                      variant="secondary"
                      className="bg-white text-xs font-normal"
                    >
                      {formatRuleLabel(rule)}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">
                Place an order matching this challenge to win exciting gifts!
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              A new challenge is coming soon. Check back later!
            </p>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 sm:justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

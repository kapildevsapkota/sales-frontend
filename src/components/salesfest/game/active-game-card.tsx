"use client";

import { Loader2, Shuffle, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActiveGame } from "@/types/game";

interface ActiveGameCardProps {
  game: ActiveGame | null;
  loading: boolean;
  choosing: boolean;
  onChooseCondition: () => void;
}

function formatRuleLabel(rule: ActiveGame["conditions"][0]["rules"][0]) {
  if (rule.rule_type === "product") {
    return `${rule.min_quantity}x ${rule.product_name ?? `Product #${rule.product}`}`;
  }
  return `${rule.min_quantity}x "${rule.keyword}"`;
}

export function ActiveGameCard({
  game,
  loading,
  choosing,
  onChooseCondition,
}: ActiveGameCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!game) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="font-medium text-muted-foreground">No Active Game</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create a new game and mark it as active to start the challenge.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeCondition = game.conditions.find(
    (c) => c.id === game.active_condition,
  );

  return (
    <Card className="overflow-hidden border-purple-200">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-purple-100">
              Active Game
            </p>
            <CardTitle className="text-lg sm:text-xl text-white">
              {game.name}
            </CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="w-fit bg-white/20 text-white hover:bg-white/20"
          >
            {game.is_active ? "Running" : "Inactive"}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <p className="text-sm text-muted-foreground">{game.description}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-purple-50/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-purple-700">
            Current Challenge
          </p>
          {game.active_condition_name ? (
            <p className="mt-1 text-base font-semibold text-purple-900">
              {game.active_condition_name}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No condition selected yet. Pick one randomly to start.
            </p>
          )}

          {activeCondition && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeCondition.rules.map((rule) => (
                <Badge key={rule.id} variant="outline" className="bg-white">
                  {formatRuleLabel(rule)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={onChooseCondition}
            disabled={choosing || game.conditions.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {choosing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shuffle className="mr-2 h-4 w-4" />
            )}
            Choose Random Condition
          </Button>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">All Conditions ({game.conditions.length})</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {game.conditions.map((condition) => {
              const isActive = condition.id === game.active_condition;
              return (
                <div
                  key={condition.id}
                  className={`rounded-lg border p-3 text-sm ${
                    isActive
                      ? "border-purple-300 bg-purple-50/80"
                      : "bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-snug">
                      {condition.name ?? condition.description}
                    </p>
                    {isActive && (
                      <Badge className="shrink-0 bg-purple-600">Live</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {condition.rules.map((rule) => (
                      <Badge
                        key={rule.id}
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {formatRuleLabel(rule)}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

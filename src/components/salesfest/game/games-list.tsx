"use client";

import { format } from "date-fns";
import { Gamepad2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@/types/game";

interface GamesListProps {
  games: Game[];
  loading: boolean;
}

export function GamesList({ games, loading }: GamesListProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading games...
        </CardContent>
      </Card>
    );
  }

  if (games.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <Gamepad2 className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No games created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">All Games</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {games.map((game, index) => (
          <div
            key={game.id ?? `${game.name}-${index}`}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold">{game.name}</h4>
                  <Badge variant={game.is_active ? "default" : "secondary"}>
                    {game.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {game.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {game.created_at &&
                  format(new Date(game.created_at), "MMM d, yyyy")}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {game.conditions.map((condition, condIndex) => (
                <Badge key={condition.id ?? condIndex} variant="outline">
                  {condition.description} ({condition.rules.length} rules)
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

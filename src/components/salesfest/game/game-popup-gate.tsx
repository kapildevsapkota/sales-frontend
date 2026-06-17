"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveGame } from "@/lib/game-api";
import { shouldShowGamePopup } from "@/lib/game-utils";
import type { ActiveGame } from "@/types/game";
import { ActiveGameDialog } from "./active-game-dialog";

function getDismissKey(game: ActiveGame) {
  return `game-popup-dismissed-${game.id}-${game.active_condition ?? "none"}-${game.updated_at}`;
}

export function GamePopupGate() {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);

  useEffect(() => {
    if (isLoading || !shouldShowGamePopup(user?.role)) {
      return;
    }

    let cancelled = false;

    async function loadActiveGame() {
      try {
        const game = await getActiveGame();
        if (cancelled || !game?.is_active) return;

        const dismissKey = getDismissKey(game);
        if (sessionStorage.getItem(dismissKey)) return;

        setActiveGame(game);
        setOpen(true);
      } catch {
        // No active game or request failed — stay silent
      }
    }

    loadActiveGame();

    return () => {
      cancelled = true;
    };
  }, [isLoading, user?.role]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && activeGame) {
      sessionStorage.setItem(getDismissKey(activeGame), "1");
    }
  };

  if (!shouldShowGamePopup(user?.role)) {
    return null;
  }

  return (
    <ActiveGameDialog
      open={open}
      onOpenChange={handleOpenChange}
      game={activeGame}
    />
  );
}

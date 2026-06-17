"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveGame } from "@/lib/game-api";
import { GAME_POLL_INTERVAL_MS, shouldShowGamePopup } from "@/lib/game-utils";
import type { ActiveGame } from "@/types/game";
import { ActiveGameDialog } from "./active-game-dialog";

function getDismissKey(game: ActiveGame) {
  return `game-popup-dismissed-${game.id}-${game.active_condition ?? "none"}-${game.updated_at}`;
}

function isDismissed(game: ActiveGame) {
  return sessionStorage.getItem(getDismissKey(game)) === "1";
}

export function GamePopupGate() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const openRef = useRef(false);
  const activeGameRef = useRef<ActiveGame | null>(null);
  const canShowRef = useRef(false);

  const canShow = !isLoading && shouldShowGamePopup(user?.role);
  canShowRef.current = canShow;

  const presentGame = useCallback((game: ActiveGame) => {
    if (!canShowRef.current || openRef.current || isDismissed(game)) return;

    activeGameRef.current = game;
    openRef.current = true;
    setActiveGame(game);
    setOpen(true);
  }, []);

  const syncActiveGame = useCallback(async () => {
    if (!canShowRef.current || openRef.current) return;

    try {
      const game = await getActiveGame();
      if (!canShowRef.current || openRef.current) return;
      if (!game?.is_active) return;
      presentGame(game);
    } catch {
      // No active game or request failed — stay silent.
    }
  }, [presentGame]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      openRef.current = false;
      const game = activeGameRef.current;
      if (game) {
        sessionStorage.setItem(getDismissKey(game), "1");
      }
    }
  }, []);

  // Check immediately when auth is ready and on navigation.
  useEffect(() => {
    if (!canShow) return;
    void syncActiveGame();
  }, [canShow, pathname, syncActiveGame]);

  // Poll so newly activated games appear without a refresh.
  useEffect(() => {
    if (!canShow) return;

    const interval = setInterval(
      () => void syncActiveGame(),
      GAME_POLL_INTERVAL_MS,
    );
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncActiveGame();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [canShow, syncActiveGame]);

  if (!canShow) return null;

  return (
    <ActiveGameDialog
      open={open}
      onOpenChange={handleOpenChange}
      game={activeGame}
    />
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  GAME_WINNER_EVENT,
  getLatestUnnotifiedWinner,
  hasShownWinner,
  markWinnerShown,
  shouldShowGamePopup,
  takePendingWinner,
  WINNER_POLL_INTERVAL_MS,
} from "@/lib/game-utils";
import { getGameWinners } from "@/lib/game-api";
import type { GameWinner } from "@/types/game";
import { GameWinnerDialog } from "./game-winner-dialog";

export function GameWinnerGate() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [winner, setWinner] = useState<GameWinner | null>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const canShow = !isLoading && shouldShowGamePopup(user?.role);

  const presentWinner = useCallback((candidate: GameWinner) => {
    if (!canShow || openRef.current || hasShownWinner(candidate)) return;
    markWinnerShown(candidate);
    openRef.current = true;
    setWinner(candidate);
    setOpen(true);
  }, [canShow]);

  const dismiss = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    setWinner(null);
  }, []);

  // Instant trigger when the current user wins (order submit).
  useEffect(() => {
    if (!canShow) return;

    function onWinnerEvent(event: Event) {
      presentWinner((event as CustomEvent<GameWinner>).detail);
    }

    window.addEventListener(GAME_WINNER_EVENT, onWinnerEvent);
    return () => window.removeEventListener(GAME_WINNER_EVENT, onWinnerEvent);
  }, [canShow, presentWinner]);

  // Fallback after navigation / refresh.
  useEffect(() => {
    if (!canShow) return;
    const pending = takePendingWinner();
    if (pending) presentWinner(pending);
  }, [pathname, canShow, presentWinner]);

  // Notify everyone else when another user wins.
  useEffect(() => {
    if (!canShow) return;

    let cancelled = false;

    async function syncWinners() {
      try {
        const winners = await getGameWinners();
        if (cancelled) return;
        const latest = getLatestUnnotifiedWinner(winners);
        if (latest) presentWinner(latest);
      } catch {
        // No winners endpoint or request failed — stay silent.
      }
    }

    void syncWinners();

    const interval = setInterval(syncWinners, WINNER_POLL_INTERVAL_MS);
    const onFocus = () => void syncWinners();

    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [canShow, presentWinner]);

  if (!canShow) return null;

  return (
    <GameWinnerDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
      winner={winner}
    />
  );
}

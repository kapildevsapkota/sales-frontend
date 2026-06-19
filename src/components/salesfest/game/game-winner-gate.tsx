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
  GAME_POLL_INTERVAL_MS,
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
  const canShowRef = useRef(false);

  const canShow = !isLoading && shouldShowGamePopup(user?.role);
  canShowRef.current = canShow;

  const presentWinner = useCallback((candidate: GameWinner) => {
    if (!canShowRef.current || openRef.current || hasShownWinner(candidate)) {
      return;
    }
    markWinnerShown(candidate);
    openRef.current = true;
    setWinner(candidate);
    setOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    setWinner(null);
  }, []);

  const syncWinners = useCallback(async () => {
    if (!canShowRef.current || openRef.current) return;

    const pending = takePendingWinner();
    if (pending) {
      presentWinner(pending);
      return;
    }

    try {
      const winners = await getGameWinners();
      if (!canShowRef.current || openRef.current) return;
      const latest = getLatestUnnotifiedWinner(winners);
      if (latest) presentWinner(latest);
    } catch {
      // No winners endpoint or request failed — stay silent.
    }
  }, [presentWinner]);

  // Always listen — event fires synchronously on order submit, before navigation.
  useEffect(() => {
    function onWinnerEvent(event: Event) {
      presentWinner((event as CustomEvent<GameWinner>).detail);
    }

    window.addEventListener(GAME_WINNER_EVENT, onWinnerEvent);
    return () => window.removeEventListener(GAME_WINNER_EVENT, onWinnerEvent);
  }, [presentWinner]);

  // Check pending winner + API as soon as auth is ready and on every navigation.
  useEffect(() => {
    if (!canShow) return;
    void syncWinners();
  }, [canShow, pathname, syncWinners]);

  // Poll for wins by other users; re-check when tab becomes visible.
  useEffect(() => {
    if (!canShow) return;

    const interval = setInterval(
      () => void syncWinners(),
      GAME_POLL_INTERVAL_MS,
    );
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncWinners();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [canShow, syncWinners]);

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

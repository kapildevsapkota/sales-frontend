"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  GAME_WINNER_EVENT,
  getLatestUnnotifiedWinner,
  hasShownWinner,
  isWinnerForUser,
  markWinnerShown,
  shouldShowWinnerDialog,
  takePendingWinner,
  GAME_POLL_INTERVAL_MS,
} from "@/lib/game-utils";
import { getGameWinners } from "@/lib/game-api";
import type { GameWinner } from "@/types/game";
import { GameWinnerDialog } from "./game-winner-dialog";

export function GameWinnerGate() {
  const { user, isLoading } = useAuth();
  const [winner, setWinner] = useState<GameWinner | null>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const canShowRef = useRef(false);
  const userRef = useRef(user);
  const winnerRef = useRef<GameWinner | null>(null);

  const canShow = !isLoading && shouldShowWinnerDialog(user?.role);
  canShowRef.current = canShow;
  userRef.current = user;

  const presentWinner = useCallback((candidate: GameWinner) => {
    const currentUser = userRef.current;
    if (
      !canShowRef.current ||
      !currentUser ||
      openRef.current ||
      hasShownWinner(candidate, currentUser.id) ||
      !isWinnerForUser(candidate, currentUser)
    ) {
      return;
    }

    markWinnerShown(candidate, currentUser.id);
    openRef.current = true;
    winnerRef.current = candidate;
    setWinner(candidate);
    setOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    const currentUser = userRef.current;
    const currentWinner = winnerRef.current;
    if (currentUser && currentWinner) {
      markWinnerShown(currentWinner, currentUser.id);
    }
    openRef.current = false;
    winnerRef.current = null;
    setOpen(false);
    setWinner(null);
  }, []);

  const syncWinners = useCallback(async () => {
    if (!canShowRef.current || openRef.current || !userRef.current) return;

    const pending = takePendingWinner();
    if (pending) {
      presentWinner(pending);
      return;
    }

    try {
      const winners = await getGameWinners();
      if (!canShowRef.current || openRef.current || !userRef.current) return;
      const latest = getLatestUnnotifiedWinner(winners, userRef.current);
      if (latest) presentWinner(latest);
    } catch {
      // No winners endpoint or request failed — stay silent.
    }
  }, [presentWinner]);

  // Instant trigger when this salesperson wins on order submit.
  useEffect(() => {
    function onWinnerEvent(event: Event) {
      presentWinner((event as CustomEvent<GameWinner>).detail);
    }

    window.addEventListener(GAME_WINNER_EVENT, onWinnerEvent);
    return () => window.removeEventListener(GAME_WINNER_EVENT, onWinnerEvent);
  }, [presentWinner]);

  // Check once when auth is ready, then poll for new wins only.
  useEffect(() => {
    if (!canShow) return;
    void syncWinners();

    const interval = setInterval(() => void syncWinners(), GAME_POLL_INTERVAL_MS);
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
  }, [canShow, user?.id, syncWinners]);

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

import { Role } from "@/contexts/AuthContext";
import type { GameWinner } from "@/types/game";

export function shouldShowGamePopup(role?: Role | null): boolean {
  return !!role && role !== Role.SuperAdmin;
}

// ─── Pending winner (persists across client-side navigation) ──────────────────

const PENDING_WINNER_KEY = "game-winner-pending";
const SHOWN_WINNERS_KEY = "game-winner-shown";
export const GAME_WINNER_EVENT = "game:winner-pending";

export const GAME_POLL_INTERVAL_MS = 3_000;

function getWinnerKey(winner: GameWinner): string {
  return winner.id
    ? String(winner.id)
    : `${winner.order_code}-${winner.won_at}`;
}

function readShownWinnerKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SHOWN_WINNERS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function hasShownWinner(winner: GameWinner): boolean {
  return readShownWinnerKeys().has(getWinnerKey(winner));
}

export function markWinnerShown(winner: GameWinner): void {
  if (typeof window === "undefined") return;
  const shown = readShownWinnerKeys();
  shown.add(getWinnerKey(winner));
  sessionStorage.setItem(SHOWN_WINNERS_KEY, JSON.stringify([...shown]));
}

/**
 * Write the winner to localStorage and dispatch a synchronous CustomEvent so
 * GameWinnerGate reacts immediately — before router.push() fires.
 */
export function setPendingWinner(winner: GameWinner): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_WINNER_KEY, JSON.stringify(winner));
  window.dispatchEvent(new CustomEvent(GAME_WINNER_EVENT, { detail: winner }));
}

/**
 * Read and remove the pending winner.
 * Returns null when nothing is stored or the value is malformed.
 */
export function takePendingWinner(): GameWinner | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PENDING_WINNER_KEY);
  if (!raw) return null;
  localStorage.removeItem(PENDING_WINNER_KEY);
  try {
    return JSON.parse(raw) as GameWinner;
  } catch {
    return null;
  }
}

// ─── API helpers ──────────────────────────────────────────────────────────────

/** Latest winner the current user has not been shown yet. */
export function getLatestUnnotifiedWinner(
  winners: GameWinner[],
): GameWinner | null {
  return (
    winners
      .filter((w) => !w.notified && !hasShownWinner(w))
      .sort(
        (a, b) => new Date(b.won_at).getTime() - new Date(a.won_at).getTime(),
      )[0] ?? null
  );
}

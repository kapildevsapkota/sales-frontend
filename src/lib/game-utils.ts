import { Role } from "@/contexts/AuthContext";
import type { GameWinner } from "@/types/game";

export function shouldShowGamePopup(role?: Role | null): boolean {
  return !!role && role !== Role.SuperAdmin;
}

export function shouldShowWinnerDialog(role?: Role | null): boolean {
  return role === Role.SalesPerson;
}

export interface WinnerUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export function getSalesPersonDisplayName(user: WinnerUser): string {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || user.username || "";
}

function normalizePersonName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** True when the logged-in user is the salesperson who won. */
export function isWinnerForUser(
  winner: GameWinner,
  user: WinnerUser | null | undefined,
): boolean {
  if (!user) return false;

  if (winner.sales_person != null) {
    return winner.sales_person === user.id;
  }

  if (winner.sales_person_name) {
    return (
      normalizePersonName(winner.sales_person_name) ===
      normalizePersonName(getSalesPersonDisplayName(user))
    );
  }

  return false;
}

// ─── Pending winner (persists across client-side navigation) ──────────────────

const PENDING_WINNER_KEY = "game-winner-pending";
const SHOWN_WINNERS_PREFIX = "game-winner-shown";
export const GAME_WINNER_EVENT = "game:winner-pending";

export const GAME_POLL_INTERVAL_MS = 3_000;

/** Stable key shared between order-submit payload and API winner records. */
function getWinnerKey(winner: GameWinner): string {
  if (winner.order_code) return winner.order_code;
  if (winner.id) return `winner-${winner.id}`;
  return `${winner.order}-${winner.won_at}`;
}

function getShownStorageKey(userId: number): string {
  return `${SHOWN_WINNERS_PREFIX}-${userId}`;
}

function readShownWinnerKeys(userId: number): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(getShownStorageKey(userId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function hasShownWinner(
  winner: GameWinner,
  userId: number | null | undefined,
): boolean {
  if (!userId) return false;
  return readShownWinnerKeys(userId).has(getWinnerKey(winner));
}

export function markWinnerShown(
  winner: GameWinner,
  userId: number | null | undefined,
): void {
  if (typeof window === "undefined" || !userId) return;
  const shown = readShownWinnerKeys(userId);
  shown.add(getWinnerKey(winner));
  localStorage.setItem(
    getShownStorageKey(userId),
    JSON.stringify([...shown]),
  );
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

/** Latest unnotified win for this salesperson that they have not seen yet. */
export function getLatestUnnotifiedWinner(
  winners: GameWinner[],
  user: WinnerUser | null | undefined,
): GameWinner | null {
  if (!user) return null;

  return (
    winners
      .filter(
        (w) =>
          !hasShownWinner(w, user.id) && isWinnerForUser(w, user),
      )
      .sort(
        (a, b) => new Date(b.won_at).getTime() - new Date(a.won_at).getTime(),
      )[0] ?? null
  );
}

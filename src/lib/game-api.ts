import { api } from "@/lib/api";
import type {
  ActiveGame,
  ChooseConditionResponse,
  CreateGamePayload,
  Game,
  GameWinner,
} from "@/types/game";

export async function listGames(): Promise<Game[]> {
  const response = await api.get<Game[] | { results: Game[] }>("/api/game/");
  const data = response.data;
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function createGame(payload: CreateGamePayload): Promise<Game> {
  const response = await api.post<Game>("/api/game/", payload);
  return response.data;
}

export async function getActiveGame(): Promise<ActiveGame | null> {
  try {
    const response = await api.get<ActiveGame>("/api/game/active/");
    return response.data;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) return null;
    throw error;
  }
}

export async function chooseRandomCondition(): Promise<ChooseConditionResponse> {
  const response = await api.post<ChooseConditionResponse>(
    "/api/game/choose-condition/",
  );
  return response.data;
}

export async function getGameWinners(): Promise<GameWinner[]> {
  const response = await api.get<GameWinner[]>("/api/game/winners/");
  return response.data;
}

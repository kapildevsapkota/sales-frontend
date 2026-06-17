"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  chooseRandomCondition,
  getActiveGame,
  getGameWinners,
  listGames,
} from "@/lib/game-api";
import { toast } from "sonner";
import { ActiveGameCard } from "./active-game-card";
import { CreateGameDialog } from "./create-game-dialog";
import { GamesList } from "./games-list";
import { WinnersTable } from "./winners-table";

export function GameManagementView() {
  const [createOpen, setCreateOpen] = useState(false);
  const [choosing, setChoosing] = useState(false);

  const {
    data: activeGame,
    isLoading: activeLoading,
    mutate: mutateActive,
  } = useSWR("game-active", getActiveGame, { revalidateOnFocus: false });

  const {
    data: games = [],
    isLoading: gamesLoading,
    mutate: mutateGames,
  } = useSWR("game-list", listGames, { revalidateOnFocus: false });

  const {
    data: winners = [],
    isLoading: winnersLoading,
    mutate: mutateWinners,
  } = useSWR("game-winners", getGameWinners, { revalidateOnFocus: false });

  const refreshAll = useCallback(() => {
    mutateActive();
    mutateGames();
    mutateWinners();
  }, [mutateActive, mutateGames, mutateWinners]);

  const handleChooseCondition = async () => {
    setChoosing(true);
    try {
      const result = await chooseRandomCondition();
      toast.success(result.message);
      refreshAll();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { detail?: string; message?: string } } })
          ?.response?.data?.detail ??
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        "Failed to choose condition";
      toast.error(typeof message === "string" ? message : "Failed to choose condition");
    } finally {
      setChoosing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-4 px-3 pb-8 sm:space-y-6 sm:px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link href="/super-admin/salesfest">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Sales Fest
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Game Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create combo challenges, activate conditions, and track winners.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Game
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="winners">Winners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <ActiveGameCard
            game={activeGame ?? null}
            loading={activeLoading}
            choosing={choosing}
            onChooseCondition={handleChooseCondition}
          />
          <GamesList games={games} loading={gamesLoading} />
        </TabsContent>

        <TabsContent value="winners">
          <WinnersTable winners={winners} loading={winnersLoading} />
        </TabsContent>
      </Tabs>

      <CreateGameDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refreshAll}
      />
    </div>
  );
}

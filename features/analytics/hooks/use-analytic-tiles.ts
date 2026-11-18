"use client";
import { useMemo } from "react";
import { useDeviceFaulty, useServerOnline } from "@/features/edge-status";
import { type LiveData, type Tile, useLive } from "@/features/live";
import { useFailureToast } from "@/hooks/use-failure-toast";

export const useAnalyticTiles = (
  initialLive: LiveData,
  isLive: boolean,
  analyticIds: string[],
) => {
  const { data: live } = useLive(initialLive, isLive);
  useFailureToast(
    "Some edge servers did not respond",
    live.failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const serverOnline = useServerOnline();
  const isFaulty = useDeviceFaulty();
  return useMemo(
    () =>
      live.tiles
        .filter(
          (tile) =>
            tile.state !== "disabled" &&
            tile.analyticId !== null &&
            analyticIds.includes(tile.analyticId),
        )
        .map((tile): Tile => {
          const server = live.servers.find((s) => s.id === tile.serverId);
          const online = server ? serverOnline(server, server.online) : false;
          return {
            ...tile,
            state: !online
              ? "server-offline"
              : isFaulty(tile.serverId, tile.id)
                ? "stream-offline"
                : "live",
          };
        }),
    [live.tiles, live.servers, analyticIds, serverOnline, isFaulty],
  );
};

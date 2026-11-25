"use client";
import { deviceStateOf } from "@/lib/device-state";
import { useMemo } from "react";
import { useDeviceFault, useServerOnline } from "@/features/edge-status";
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
  const fault = useDeviceFault();
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
          return {
            ...tile,
            state: deviceStateOf({
              isServerActive: server?.isActive ?? true,
              isServerOnline: server
                ? serverOnline(server, server.online)
                : false,
              fault: fault(tile.serverId, tile.id),
            }),
          };
        }),
    [live.tiles, live.servers, analyticIds, serverOnline, fault],
  );
};

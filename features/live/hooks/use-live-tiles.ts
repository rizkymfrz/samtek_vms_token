"use client";
import { useMemo } from "react";
import { useDeviceFaulty, useServerOnline } from "@/features/edge-status";
import type { LiveData, Tile } from "../types";

export const useLiveTiles = (live: LiveData) => {
  const serverOnline = useServerOnline();
  const isFaulty = useDeviceFaulty();
  const servers = useMemo(
    () =>
      live.servers.map((s) => ({ ...s, online: serverOnline(s, s.online) })),
    [live.servers, serverOnline],
  );
  const tiles = useMemo(() => {
    const online = new Map(servers.map((s) => [s.id, s.online]));
    return live.tiles.map((tile): Tile =>
      tile.state === "disabled"
        ? tile
        : {
            ...tile,
            state: !online.get(tile.serverId)
              ? "server-offline"
              : isFaulty(tile.serverId, tile.id)
                ? "stream-offline"
                : "live",
          },
    );
  }, [live.tiles, servers, isFaulty]);
  return { servers, tiles };
};

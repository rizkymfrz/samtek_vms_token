"use client";
import { useMemo } from "react";
import { useDeviceFault, useServerOnline } from "@/features/edge-status";
import { deviceStateOf } from "@/lib/device-state";
import type { LiveData, Tile } from "../types";

export const useLiveTiles = (live: LiveData) => {
  const serverOnline = useServerOnline();
  const fault = useDeviceFault();
  const servers = useMemo(
    () =>
      live.servers.map((s) => ({ ...s, online: serverOnline(s, s.online) })),
    [live.servers, serverOnline],
  );
  const tiles = useMemo(() => {
    const byId = new Map(servers.map((s) => [s.id, s]));
    return live.tiles.map((tile): Tile => {
      if (tile.state === "disabled") return tile;
      const server = byId.get(tile.serverId);
      const kind = fault(tile.serverId, tile.id);
      return {
        ...tile,
        isPartial: kind === "partial",
        state: deviceStateOf({
          isServerActive: server?.isActive ?? true,
          isServerOnline: server?.online ?? false,
          fault: kind,
        }),
      };
    });
  }, [live.tiles, servers, fault]);
  return { servers, tiles };
};

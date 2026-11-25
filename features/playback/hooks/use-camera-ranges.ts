"use client";
import { useQueries } from "@tanstack/react-query";
import { mqttConfig } from "@/config/mqtt";
import { dayBounds, extendToNewest } from "@/features/camera-detail/playback";
import {
  getRecordingDevice,
  queryRecording,
  type RecordingRange,
  type RecordingStream,
} from "@/features/edge-status";
import type { Tile } from "@/features/live";
import { isServerDown } from "@/lib/device-state";

const REFRESH_MS = 60_000;

export const useCameraRanges = (
  tiles: Tile[],
  stream: (tile: Tile) => RecordingStream,
  day: Date,
) => {
  const { from, to } = dayBounds(day);
  const results = useQueries({
    queries: tiles.map((tile) => ({
      queryKey: [
        "recording",
        tile.serverId,
        tile.id,
        stream(tile),
        from.getTime(),
      ],
      queryFn: () =>
        queryRecording(tile.serverId, tile.id, stream(tile), from, to),
      enabled: mqttConfig !== null && !isServerDown(tile.state),
      refetchInterval: REFRESH_MS,
      retry: false,
    })),
  });
  const byId = new Map<string, RecordingRange[]>();
  tiles.forEach((tile, index) => {
    byId.set(
      tile.id,
      extendToNewest(
        results[index]?.data?.ranges ?? [],
        getRecordingDevice(tile.serverId, tile.id)?.newestAt ?? null,
        to.getTime(),
      ),
    );
  });
  return byId;
};

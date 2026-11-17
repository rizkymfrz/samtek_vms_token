"use client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { TRAIL_REFRESH_MS } from "../lib/trail";
import { fetchDevicePositions } from "../services/map-api";
import type { TrackTarget } from "../types";

export const useDevicePositions = (target: TrackTarget | null) =>
  useQuery({
    queryKey: ["device-positions", target?.edgeServerId, target?.deviceId],
    queryFn: target ? () => fetchDevicePositions(target) : skipToken,
    refetchInterval: TRAIL_REFRESH_MS,
  });

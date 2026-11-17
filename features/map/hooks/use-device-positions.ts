"use client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchDevicePositions } from "../services/map-api";
import type { TrackTarget } from "../types";

export const devicePositionsKey = (
  target: TrackTarget | null,
  dayStart: number,
) => ["device-positions", target?.edgeServerId, target?.deviceId, dayStart];

export const useDevicePositions = (
  target: TrackTarget | null,
  dayStart: number,
) =>
  useQuery({
    queryKey: devicePositionsKey(target, dayStart),
    queryFn: target ? () => fetchDevicePositions(target, dayStart) : skipToken,
    staleTime: Infinity,
  });

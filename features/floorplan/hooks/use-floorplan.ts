"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { fetchFloorplan } from "../services/floorplan-api";
import type { FloorplanData } from "../types";

export const FLOORPLAN_QUERY_KEY = ["floorplan"] as const;

export const useFloorplan = (initialData: FloorplanData, isLive: boolean) =>
  useQuery({
    queryKey: FLOORPLAN_QUERY_KEY,
    queryFn: fetchFloorplan,
    initialData,
    staleTime: isLive ? LIVE_STALE_TIME_MS : Infinity,
  });

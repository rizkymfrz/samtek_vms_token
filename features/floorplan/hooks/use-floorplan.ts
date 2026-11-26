"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchFloorplan } from "../services/floorplan-api";
import type { FloorplanData } from "../types";

export const FLOORPLAN_QUERY_KEY = QUERY_KEYS.floorplan;

export const useFloorplan = (initialData: FloorplanData) =>
  useQuery({
    queryKey: FLOORPLAN_QUERY_KEY,
    queryFn: fetchFloorplan,
    initialData,
    staleTime: LIVE_STALE_TIME_MS,
  });

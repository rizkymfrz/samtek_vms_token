"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { fetchMap } from "../services/map-api";
import type { MapData } from "../types";

export const MAP_QUERY_KEY = ["map"] as const;

export const useMap = (initialData: MapData, isLive: boolean) =>
  useQuery({
    queryKey: MAP_QUERY_KEY,
    queryFn: fetchMap,
    initialData,
    staleTime: isLive ? LIVE_STALE_TIME_MS : Infinity,
  });

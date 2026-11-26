"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchMap } from "../services/map-api";
import type { MapData } from "../types";

export const MAP_QUERY_KEY = QUERY_KEYS.map;

export const useMap = (initialData: MapData) =>
  useQuery({
    queryKey: MAP_QUERY_KEY,
    queryFn: fetchMap,
    initialData,
    staleTime: LIVE_STALE_TIME_MS,
  });

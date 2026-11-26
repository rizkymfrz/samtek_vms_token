"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchLive } from "../services/live-api";
import type { LiveData } from "../types";

export const LIVE_QUERY_KEY = QUERY_KEYS.live;

export const useLive = (initialData: LiveData) =>
  useQuery({
    queryKey: LIVE_QUERY_KEY,
    queryFn: fetchLive,
    initialData,
    staleTime: LIVE_STALE_TIME_MS,
  });

"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { fetchLive } from "../services/live-api";
import type { LiveData } from "../types";

export const LIVE_QUERY_KEY = ["live"] as const;

export const useLive = (initialData: LiveData, isLive: boolean) =>
  useQuery({
    queryKey: LIVE_QUERY_KEY,
    queryFn: fetchLive,
    initialData,
    staleTime: isLive ? LIVE_STALE_TIME_MS : Infinity,
  });

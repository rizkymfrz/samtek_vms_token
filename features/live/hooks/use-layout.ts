"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { fetchLayout } from "../services/live-api";
import type { LiveLayout } from "../types";

export const layoutQueryKey = (id: string | null) => ["layout", id] as const;

export const useLayout = (
  id: string | null,
  initial: LiveLayout | undefined,
  isLive: boolean,
) =>
  useQuery({
    queryKey: layoutQueryKey(id),
    queryFn: () => fetchLayout(id as string),
    enabled: id !== null,
    initialData: initial,
    staleTime: isLive ? LIVE_STALE_TIME_MS : Infinity,
  });

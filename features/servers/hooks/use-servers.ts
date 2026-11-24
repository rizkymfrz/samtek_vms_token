"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchServers } from "../services/fetch-servers";
import type { ServersData } from "../types";

export const SERVERS_QUERY_KEY = QUERY_KEYS.servers;

export const useServers = (initialData: ServersData, isLive: boolean) =>
  useQuery({
    queryKey: SERVERS_QUERY_KEY,
    queryFn: fetchServers,
    initialData,
    staleTime: isLive ? LIVE_STALE_TIME_MS : Infinity,
  });

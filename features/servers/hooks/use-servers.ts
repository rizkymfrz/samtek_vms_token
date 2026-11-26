"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchServers } from "../services/fetch-servers";
import type { ServersData } from "../types";

export const SERVERS_QUERY_KEY = QUERY_KEYS.servers;

export const useServers = (initialData: ServersData) =>
  useQuery({
    queryKey: SERVERS_QUERY_KEY,
    queryFn: fetchServers,
    initialData,
    staleTime: LIVE_STALE_TIME_MS,
  });

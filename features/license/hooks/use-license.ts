"use client";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query";
import { fetchLicense } from "../services/fetch-license";

export const useLicense = (serverId: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.license, serverId],
    queryFn: () => fetchLicense(serverId),
    enabled: serverId !== "",
    staleTime: 60_000,
  });

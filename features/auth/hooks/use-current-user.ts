"use client";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/config/query";
import { fetchCurrentUser } from "../services/fetch-current-user";

const STALE_TIME_MS = 300_000;

export const useCurrentUser = () =>
  useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: fetchCurrentUser,
    staleTime: STALE_TIME_MS,
  });

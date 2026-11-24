"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchUsers } from "../services/fetch-users";
import type { UsersData } from "../types";

export const USERS_QUERY_KEY = QUERY_KEYS.users;

export const useUsers = (initialData: UsersData, isLive: boolean) =>
  useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: fetchUsers,
    initialData,
    staleTime: isLive ? LIVE_STALE_TIME_MS : Infinity,
  });

"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "../services/fetch-current-user";

const STALE_TIME_MS = 300_000;

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: STALE_TIME_MS,
  });

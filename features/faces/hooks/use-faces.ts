"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { fetchFaces } from "../services/face-api";
import type { FacesData } from "../types";

export const FACES_QUERY_KEY = ["faces"] as const;

export const useFaces = (initialData: FacesData, isLive: boolean) =>
  useQuery({
    queryKey: FACES_QUERY_KEY,
    queryFn: fetchFaces,
    initialData,
    staleTime: isLive ? LIVE_STALE_TIME_MS : Infinity,
  });

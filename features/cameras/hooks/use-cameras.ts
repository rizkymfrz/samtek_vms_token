"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { fetchCameras } from "../services/fetch-cameras";
import type { CameraData } from "../types";

export const CAMERAS_QUERY_KEY = ["cameras"] as const;

export const useCameras = (initialData: CameraData, isLive: boolean) =>
  useQuery({
    queryKey: CAMERAS_QUERY_KEY,
    queryFn: fetchCameras,
    initialData,
    staleTime: isLive ? LIVE_STALE_TIME_MS : Infinity,
  });

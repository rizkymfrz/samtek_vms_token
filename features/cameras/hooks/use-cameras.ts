"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchCameras } from "../services/fetch-cameras";
import type { CameraData } from "../types";

export const CAMERAS_QUERY_KEY = QUERY_KEYS.cameras;

export const useCameras = (initialData: CameraData) =>
  useQuery({
    queryKey: CAMERAS_QUERY_KEY,
    queryFn: fetchCameras,
    initialData,
    staleTime: LIVE_STALE_TIME_MS,
  });

"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { CAMERAS_QUERY_KEY } from "./use-cameras";
import { fetchCameras } from "../services/fetch-cameras";

export const useDeviceList = () =>
  useQuery({
    queryKey: CAMERAS_QUERY_KEY,
    queryFn: fetchCameras,
    staleTime: LIVE_STALE_TIME_MS,
    refetchInterval: LIVE_STALE_TIME_MS,
  });

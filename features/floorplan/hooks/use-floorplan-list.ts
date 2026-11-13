"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS } from "@/config/query";
import { FLOORPLAN_QUERY_KEY } from "./use-floorplan";
import { fetchFloorplan } from "../services/floorplan-api";

export const useFloorplanList = () =>
  useQuery({
    queryKey: FLOORPLAN_QUERY_KEY,
    queryFn: fetchFloorplan,
    staleTime: LIVE_STALE_TIME_MS,
  });

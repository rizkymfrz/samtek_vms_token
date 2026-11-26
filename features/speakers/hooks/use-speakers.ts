"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchSpeakers } from "../services/fetch-speakers";
import type { SpeakersData } from "../types";

export const useSpeakers = (initialData: SpeakersData) =>
  useQuery({
    queryKey: QUERY_KEYS.speakers,
    queryFn: fetchSpeakers,
    initialData,
    staleTime: LIVE_STALE_TIME_MS,
  });

"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchSpeakerCalls } from "../services/audio-api";

export const useSpeakerCalls = () =>
  useQuery({
    queryKey: QUERY_KEYS.speakerCalls,
    queryFn: fetchSpeakerCalls,
    staleTime: LIVE_STALE_TIME_MS,
  });

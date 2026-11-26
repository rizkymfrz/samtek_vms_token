"use client";
import { useQuery } from "@tanstack/react-query";
import { LIVE_STALE_TIME_MS, QUERY_KEYS } from "@/config/query";
import { fetchSpeakers } from "../services/fetch-speakers";

export const useEdgeSpeakers = (edgeServerId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.speakers,
    queryFn: fetchSpeakers,
    staleTime: LIVE_STALE_TIME_MS,
    select: (data) =>
      data.speakers.filter((speaker) => speaker.edgeServerId === edgeServerId),
  });

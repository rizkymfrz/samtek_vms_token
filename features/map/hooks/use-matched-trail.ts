"use client";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { chunkTrail, thinTrail } from "../lib/trail";
import { fetchMatchedChunk } from "../services/map-api";

export const useMatchedTrail = (raw: [number, number][], scope: string) => {
  const chunks = useMemo(() => chunkTrail(thinTrail(raw)), [raw]);
  const matched = useQueries({
    queries: chunks.map((chunk) => ({
      queryKey: [
        "trail-match",
        scope,
        chunks.indexOf(chunk),
        chunk.length,
        chunk.at(-1),
      ],
      queryFn: () => fetchMatchedChunk(chunk),
      staleTime: Infinity,
      retry: false,
    })),
    combine: (results) => results.map((result) => result.data ?? null),
  });
  return useMemo(
    () => chunks.flatMap((chunk, index) => matched[index] ?? chunk),
    [chunks, matched],
  );
};

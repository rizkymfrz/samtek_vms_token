"use client";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { mqttConfig } from "@/config/mqtt";
import {
  subscribeEdgeEvents,
  subscribeEdgeReconnect,
} from "@/features/edge-status";
import { addRecognition } from "../lib/merge-recognitions";
import { toRow } from "../lib/recognition-row";
import { recognitionWindow, windowKey } from "../lib/recognition-window";
import { fetchRecognitions } from "../services/fetch-recognitions";
import type { RecognitionsData } from "../types";

const POLL_INTERVAL_MS = 15_000;

export const useRecognitionLog = (
  recognizer: string,
  initialData: RecognitionsData,
  isPolling: boolean,
  range: DateRange | undefined,
) => {
  const key = windowKey(range);
  const queryClient = useQueryClient();
  const isLive = isPolling && mqttConfig !== null;
  useEffect(() => {
    if (!isLive) return;
    const queryKey = ["recognitions", recognizer, key];
    const stopEvents = subscribeEdgeEvents((event) => {
      if (
        event.kind !== "recognition" ||
        event.data.recognizer !== recognizer
      ) {
        return;
      }
      const window = recognitionWindow(range, Date.now());
      if (window.until !== null) return;
      queryClient.setQueryData<RecognitionsData>(queryKey, (previous) => {
        if (!previous) return previous;
        const names = new Map(Object.entries(previous.cameraNames));
        return addRecognition(
          previous,
          toRow(
            event.edgeId,
            event.data,
            names,
            true,
            new Map(Object.entries(previous.references)),
          ),
          window.since,
        );
      });
    });
    const stopReconnect = subscribeEdgeReconnect(() => {
      void queryClient.invalidateQueries({ queryKey });
    });
    return () => {
      stopEvents();
      stopReconnect();
    };
  }, [isLive, recognizer, key, range, queryClient]);
  return useQuery({
    queryKey: ["recognitions", recognizer, key],
    queryFn: () =>
      fetchRecognitions({
        recognizer,
        ...recognitionWindow(range, Date.now()),
      }),
    initialData: range?.from ? undefined : initialData,
    placeholderData: keepPreviousData,
    refetchInterval: () =>
      isPolling &&
      mqttConfig === null &&
      recognitionWindow(range, Date.now()).until === null
        ? POLL_INTERVAL_MS
        : false,
  });
};

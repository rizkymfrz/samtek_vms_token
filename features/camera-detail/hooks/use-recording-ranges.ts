"use client";
import { useQuery } from "@tanstack/react-query";
import { mqttConfig } from "@/config/mqtt";
import { queryRecording, type RecordingStream } from "@/features/edge-status";
import { dayBounds } from "../lib/recording-timeline";

const REFRESH_MS = 60_000;

export const useRecordingRanges = (
  edgeId: string,
  deviceId: string,
  stream: RecordingStream,
  day: Date,
  isOnline: boolean,
) => {
  const { from, to } = dayBounds(day);
  return useQuery({
    queryKey: ["recording", edgeId, deviceId, stream, from.getTime()],
    queryFn: () => queryRecording(edgeId, deviceId, stream, from, to),
    enabled: mqttConfig !== null && isOnline,
    refetchInterval: REFRESH_MS,
    retry: false,
  });
};

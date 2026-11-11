import { edgeDownTopic } from "@/config/mqtt";
import { sendEdgeCommand } from "./edge-status-store";
import { recordingResultSchema } from "../schemas/edge-message";
import type { RecordingRange, RecordingStream } from "../types";

export type RecordingRanges = {
  segmentSeconds: number;
  ranges: RecordingRange[];
};

export const queryRecording = async (
  edgeId: string,
  deviceId: string,
  stream: RecordingStream,
  from: Date,
  to: Date,
): Promise<RecordingRanges> => {
  const result = await sendEdgeCommand(
    edgeDownTopic(edgeId),
    "recording.query",
    {
      device_id: deviceId,
      stream,
      from: from.toISOString(),
      to: to.toISOString(),
    },
  );
  const parsed = recordingResultSchema.safeParse(result.recording);
  if (!parsed.success) throw new Error("The edge sent an unreadable answer");
  return {
    segmentSeconds: parsed.data.segment_seconds,
    ranges: parsed.data.ranges.map((range) => ({
      from: Date.parse(range.from),
      to: Date.parse(range.to),
    })),
  };
};

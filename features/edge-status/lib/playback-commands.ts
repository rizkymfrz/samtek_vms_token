import { edgeDownTopic } from "@/config/mqtt";
import { sendEdgeCommand } from "./edge-status-store";
import { playbackResultSchema } from "../schemas/edge-message";
import type { PlaybackSession, RecordingStream } from "../types";

const toSession = (result: { playback?: unknown }): PlaybackSession => {
  const parsed = playbackResultSchema.safeParse(result.playback);
  if (!parsed.success) throw new Error("The edge sent an unreadable answer");
  const { session_id, app, stream, state, position, speed } = parsed.data;
  return {
    sessionId: session_id,
    app,
    stream,
    state,
    position: Date.parse(position),
    speed,
    receivedAt: Date.now(),
  };
};

export const startPlayback = async (
  edgeId: string,
  sessionId: string,
  deviceId: string,
  stream: RecordingStream,
  at: Date,
  speed: number,
) =>
  toSession(
    await sendEdgeCommand(edgeDownTopic(edgeId), "playback.start", {
      session_id: sessionId,
      device_id: deviceId,
      stream,
      at: at.toISOString(),
      speed,
    }),
  );

export const controlPlayback = async (
  edgeId: string,
  sessionId: string,
  action: "seek" | "pause" | "resume" | "speed" | "status",
  extra: { at?: Date; speed?: number } = {},
) =>
  toSession(
    await sendEdgeCommand(edgeDownTopic(edgeId), "playback.control", {
      session_id: sessionId,
      action,
      ...(extra.at && { at: extra.at.toISOString() }),
      ...(extra.speed !== undefined && { speed: extra.speed }),
    }),
  );

export const stopPlayback = (edgeId: string, sessionId: string) =>
  sendEdgeCommand(edgeDownTopic(edgeId), "playback.stop", {
    session_id: sessionId,
  });

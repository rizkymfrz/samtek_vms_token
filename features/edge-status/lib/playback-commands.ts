import { edgeDownTopic } from "@/config/mqtt";
import { sendEdgeCommand } from "./edge-status-store";
import {
  closePlaybackBoxes,
  openPlaybackBoxes,
  settlePlaybackBoxes,
} from "./playback-box-store";
import { playbackResultSchema } from "../schemas/edge-message";
import type { PlaybackSession, RecordingStream } from "../types";

const toSession = (result: { playback?: unknown }): PlaybackSession => {
  const parsed = playbackResultSchema.safeParse(result.playback);
  if (!parsed.success) throw new Error("The edge sent an unreadable answer");
  const { session_id, app, stream, state, position, speed, boxes } =
    parsed.data;
  return {
    sessionId: session_id,
    app,
    stream,
    state,
    position: Date.parse(position),
    speed,
    hasBoxes: boxes === true,
    receivedAt: Date.now(),
  };
};

const startWithBoxes = async (
  sessionId: string,
  wantsBoxes: boolean,
  data: Record<string, unknown>,
  edgeId: string,
) => {
  openPlaybackBoxes(sessionId);
  try {
    const session = toSession(
      await sendEdgeCommand(edgeDownTopic(edgeId), "playback.start", {
        session_id: sessionId,
        ...data,
        boxes: wantsBoxes,
        speed: 1,
      }),
    );
    settlePlaybackBoxes(
      sessionId,
      !wantsBoxes ? "unsupported" : session.hasBoxes ? "timed" : "declined",
    );
    return session;
  } catch (failure) {
    closePlaybackBoxes(sessionId);
    throw failure;
  }
};

export const startPlayback = (
  edgeId: string,
  sessionId: string,
  deviceId: string,
  stream: RecordingStream,
  at: Date,
  wantsBoxes: boolean,
) =>
  startWithBoxes(
    sessionId,
    wantsBoxes,
    { device_id: deviceId, stream, at: at.toISOString() },
    edgeId,
  );

export const startClipPlayback = (
  edgeId: string,
  sessionId: string,
  eventId: string,
  wantsBoxes: boolean,
) => startWithBoxes(sessionId, wantsBoxes, { event_id: eventId }, edgeId);

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

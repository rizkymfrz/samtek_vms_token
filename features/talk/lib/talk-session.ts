export type TalkEndReason =
  | "stopped"
  | "replaced"
  | "idle"
  | "failed"
  | "device_removed"
  | "edge_offline"
  | "connection_lost"
  | "timeout"
  | "rejected";

export type TalkSession =
  | { phase: "idle" }
  | { phase: "starting"; sessionId: string }
  | { phase: "connecting"; sessionId: string }
  | { phase: "active"; sessionId: string }
  | {
      phase: "ended";
      sessionId: string;
      reason: TalkEndReason;
      detail: string | null;
    };

export type TalkEvent =
  | { type: "start"; sessionId: string }
  | { type: "result"; sessionId: string; state: "connecting" | "active" }
  | { type: "refused"; sessionId: string; message: string }
  | { type: "active"; sessionId: string }
  | {
      type: "ended";
      sessionId: string;
      reason: TalkEndReason;
      detail?: string;
    }
  | { type: "local"; reason: TalkEndReason; detail?: string }
  | { type: "reset" };

export const TALK_IDLE: TalkSession = { phase: "idle" };

const REASON_TEXT: Record<TalkEndReason, string> = {
  stopped: "Talk ended.",
  replaced: "Another user took over this camera.",
  idle: "Talk ended after 60 seconds without audio.",
  failed: "The camera could not be reached.",
  device_removed: "The camera was removed or can no longer talk.",
  edge_offline: "The edge server went offline.",
  connection_lost:
    "The connection to the MQTT broker was lost. Start talk again.",
  timeout: "The camera did not answer within 30 seconds.",
  rejected: "The edge server refused to start talk.",
};

const START_FAILURES: ReadonlySet<TalkEndReason> = new Set([
  "failed",
  "rejected",
  "timeout",
]);

export const endTitle = (reason: TalkEndReason) =>
  START_FAILURES.has(reason) ? "Failed to start talk" : "Talk ended";

export const endText = (reason: TalkEndReason, detail: string | null) =>
  detail && (reason === "failed" || reason === "rejected")
    ? `${REASON_TEXT[reason]} ${detail}`
    : REASON_TEXT[reason];

export const isLive = (
  session: TalkSession,
): session is Extract<
  TalkSession,
  { phase: "starting" | "connecting" | "active" }
> =>
  session.phase === "starting" ||
  session.phase === "connecting" ||
  session.phase === "active";

const ended = (
  sessionId: string,
  reason: TalkEndReason,
  detail: string | null,
): TalkSession => ({ phase: "ended", sessionId, reason, detail });

export const reduceTalk = (
  session: TalkSession,
  event: TalkEvent,
): TalkSession => {
  switch (event.type) {
    case "start":
      return { phase: "starting", sessionId: event.sessionId };
    case "reset":
      return TALK_IDLE;
    case "local":
      return isLive(session) && "sessionId" in session
        ? ended(session.sessionId, event.reason, event.detail ?? null)
        : session;
  }
  if (!isLive(session) || !("sessionId" in session)) return session;
  if (event.sessionId !== session.sessionId) return session;
  switch (event.type) {
    case "result":
      return session.phase === "starting" ||
        (session.phase === "connecting" && event.state === "active")
        ? { phase: event.state, sessionId: session.sessionId }
        : session;
    case "active":
      return session.phase === "connecting" || session.phase === "starting"
        ? { phase: "active", sessionId: session.sessionId }
        : session;
    case "refused":
      return ended(session.sessionId, "rejected", event.message);
    case "ended":
      return ended(session.sessionId, event.reason, event.detail ?? null);
  }
};

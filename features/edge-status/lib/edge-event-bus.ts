import type {
  EdgeAlarmMessage,
  EdgeClipMessage,
  EdgeRecognitionMessage,
} from "../schemas/edge-message";

export type EdgeEvent =
  | { kind: "alarm"; edgeId: string; data: EdgeAlarmMessage }
  | { kind: "clip"; edgeId: string; data: EdgeClipMessage }
  | { kind: "recognition"; edgeId: string; data: EdgeRecognitionMessage };

const SEEN_LIMIT = 500;
const seen = new Set<string>();
const listeners = new Set<(event: EdgeEvent) => void>();
const reconnectListeners = new Set<() => void>();

const isDuplicate = (messageId: string) => {
  if (seen.has(messageId)) return true;
  seen.add(messageId);
  if (seen.size > SEEN_LIMIT) {
    const oldest = seen.values().next().value;
    if (oldest !== undefined) seen.delete(oldest);
  }
  return false;
};

export const publishEdgeEvent = (messageId: string, event: EdgeEvent) => {
  if (isDuplicate(messageId)) return;
  for (const listener of listeners) listener(event);
};

export const publishEdgeReconnect = () => {
  for (const listener of reconnectListeners) listener();
};

export const subscribeEdgeEvents = (listener: (event: EdgeEvent) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const subscribeEdgeReconnect = (listener: () => void) => {
  reconnectListeners.add(listener);
  return () => {
    reconnectListeners.delete(listener);
  };
};

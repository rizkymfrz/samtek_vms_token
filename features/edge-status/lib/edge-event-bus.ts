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

type TalkListener = (edgeId: string, message: unknown) => void;

const talkListeners = new Set<TalkListener>();

export const publishEdgeTalk = (edgeId: string, message: unknown) => {
  for (const listener of talkListeners) listener(edgeId, message);
};

export const subscribeEdgeTalk = (listener: TalkListener) => {
  talkListeners.add(listener);
  return () => {
    talkListeners.delete(listener);
  };
};

type ScanListener = (edgeId: string, message: unknown) => void;

const scanListeners = new Set<ScanListener>();

export const publishEdgeScan = (edgeId: string, message: unknown) => {
  for (const listener of scanListeners) listener(edgeId, message);
};

export const subscribeEdgeScan = (listener: ScanListener) => {
  scanListeners.add(listener);
  return () => {
    scanListeners.delete(listener);
  };
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

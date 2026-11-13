import { subscribeEdgeEvents } from "./edge-event-bus";
import type { EdgeRecognitionMessage } from "../schemas/edge-message";

export type RecognitionEntry = EdgeRecognitionMessage & { edgeId: string };

const KEEP = 100;
const NONE: readonly RecognitionEntry[] = [];

let entries = NONE;
let isStarted = false;

const listeners = new Set<() => void>();

export const startRecognitionStore = () => {
  if (isStarted) return;
  isStarted = true;
  subscribeEdgeEvents((event) => {
    if (event.kind !== "recognition") return;
    const key = `${event.edgeId}:${event.data.event_id}`;
    if (entries.some((e) => `${e.edgeId}:${e.event_id}` === key)) return;
    entries = [{ ...event.data, edgeId: event.edgeId }, ...entries].slice(
      0,
      KEEP,
    );
    for (const listener of listeners) listener();
  });
};

export const subscribeRecognitions = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getRecognitions = () => entries;
export const getServerRecognitions = () => NONE;

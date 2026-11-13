import { formatDate, formatTime } from "./format-recognition";
import type { RecognitionRow } from "../types";

type RecognitionInput = {
  event_id: string;
  device_id: string;
  recognizer: string;
  occurred_at: string;
  object?: { confidence: number } | undefined;
  result: Record<string, unknown>;
};

const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value !== "" ? value : fallback;

export const cropUrl = (edgeId: string, eventId: string) =>
  `/api/edge/${edgeId}/recognitions/${eventId}/crop`;

export const toRow = (
  edgeId: string,
  recognition: RecognitionInput,
  cameraNames: ReadonlyMap<string, string>,
  hasCrop: boolean,
  references: ReadonlyMap<string, string>,
): RecognitionRow => {
  const occurredAt = new Date(recognition.occurred_at);
  const { result } = recognition;
  return {
    id: `${edgeId}:${recognition.event_id}`,
    edgeId,
    eventId: recognition.event_id,
    at: occurredAt.getTime(),
    time: formatTime(occurredAt),
    date: formatDate(occurredAt),
    recognizer: recognition.recognizer,
    camera: cameraNames.get(recognition.device_id) ?? recognition.device_id,
    personId: typeof result.person_id === "string" ? result.person_id : null,
    name: text(result.person_name, "Unknown"),
    group: text(result.person_group, "Unknown"),
    similarity:
      typeof result.similarity === "number" ? result.similarity : null,
    confidence: recognition.object?.confidence ?? 0,
    cropUrl: hasCrop ? cropUrl(edgeId, recognition.event_id) : null,
    referenceUrl:
      typeof result.person_id === "string"
        ? (references.get(`${edgeId}:${result.person_id}`) ?? null)
        : null,
  };
};

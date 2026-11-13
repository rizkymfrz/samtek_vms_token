import type { EdgeAlarmMessage, EdgeClipMessage } from "@/features/edge-status";
import { formatDate, formatTime, titleCase } from "./format-alert";
import type { EdgeAlarm } from "../schemas/edge-alarm";
import type { AlertClip, AlertRow } from "../types";

export type EdgeRelay = AlertClip["relay"];

type ClipFields = Pick<
  EdgeAlarm,
  | "clip_offset_seconds"
  | "clip_duration_seconds"
  | "clip_window_start_seconds"
  | "clip_window_seconds"
>;

const clipDurationMs = (clip: ClipFields) => {
  const seconds = clip.clip_window_seconds || clip.clip_duration_seconds;
  return seconds && seconds > 0 ? seconds * 1000 : null;
};

export const toClip = (
  edgeId: string,
  eventId: string,
  occurredAt: number,
  clip: ClipFields,
  relay: EdgeRelay,
): AlertClip => ({
  edgeId,
  eventId,
  startAt:
    clip.clip_offset_seconds === undefined
      ? null
      : occurredAt -
        clip.clip_offset_seconds * 1000 +
        (clip.clip_window_seconds
          ? (clip.clip_window_start_seconds ?? 0) * 1000
          : 0),
  durationMs: clipDurationMs(clip),
  relay,
});

export const toRow = (
  edgeId: string,
  relay: EdgeRelay,
  alarm: EdgeAlarm,
  cameraNames: ReadonlyMap<string, string>,
): AlertRow => {
  const occurredAt = new Date(alarm.occurred_at);
  return {
    id: `${edgeId}:${alarm.event_id}`,
    at: occurredAt.getTime(),
    time: formatTime(occurredAt),
    date: formatDate(occurredAt),
    title: alarm.title,
    description: alarm.description,
    risk: alarm.risk_level,
    camera: cameraNames.get(alarm.device_id) ?? alarm.device_id,
    analyticId: alarm.analytic_id,
    kind: alarm.kind,
    analytic: titleCase(alarm.analytic_id),
    object: titleCase(alarm.object?.label ?? "unknown"),
    score: alarm.object?.confidence ?? 0,
    perimeter: alarm.perimeter
      ? `${alarm.perimeter.name} (${alarm.perimeter.shape})`
      : "None",
    trackId: alarm.object?.track_id ?? 0,
    frame: "—",
    imagePath: alarm.image_path ?? "",
    imageUrl: alarm.image_path
      ? `/api/edge/${edgeId}/alarms/${alarm.event_id}/image`
      : null,
    clip: alarm.clip_path
      ? toClip(edgeId, alarm.event_id, occurredAt.getTime(), alarm, relay)
      : null,
    details: Object.entries(alarm.detail).map(([key, value]) => ({
      label: titleCase(key),
      value: Array.isArray(value) ? value.join(", ") : String(value),
    })),
  };
};

export const alarmFromMessage = (message: EdgeAlarmMessage): EdgeAlarm => ({
  event_id: message.event_id,
  device_id: message.device_id,
  occurred_at: message.occurred_at,
  title: message.title,
  description: message.description,
  risk_level: message.risk_level,
  analytic_id: message.analytic_id,
  kind: message.kind,
  object: message.object,
  perimeter: message.perimeter,
  detail: Object.fromEntries(
    Object.entries(message.detail).map(([key, value]) => [
      key,
      typeof value === "boolean" ? String(value) : value,
    ]),
  ),
  image_path: message.image
    ? `${message.analytic_id}/${message.event_id}_${message.image.width}x${message.image.height}.jpg`
    : undefined,
});

export const clipFromMessage = (
  edgeId: string,
  occurredAt: number,
  message: EdgeClipMessage,
  relay: EdgeRelay,
): AlertClip | null =>
  message.status === "ready" && message.clip
    ? toClip(
        edgeId,
        message.event_id,
        occurredAt,
        {
          clip_offset_seconds: message.clip.offset_seconds,
          clip_duration_seconds: message.clip.duration_seconds,
          clip_window_start_seconds: message.clip.window_start_seconds,
          clip_window_seconds: message.clip.window_seconds,
        },
        relay,
      )
    : null;

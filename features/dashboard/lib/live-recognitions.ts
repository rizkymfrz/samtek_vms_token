import type { RecognitionEntry } from "@/features/edge-status";
import { clock, titleCase } from "./format";

export type RecentFace = {
  id: string;
  name: string;
  group: string;
  similarity: number;
  device: string;
  time: string;
  visitor: boolean;
};

export type RecentPlate = {
  id: string;
  plate: string;
  vehicle: string;
  device: string;
  time: string;
};

const FACE_RECOGNIZERS = new Set([
  "face_recognition",
  "face_visitor_attendance",
]);

const PLATE_RECOGNIZERS = new Set([
  "license_plate_recognition",
  "vehicle_license_plate_recognition",
]);

const LIMIT = 5;

const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value !== "" ? value : fallback;

const deviceOf = (
  entry: RecognitionEntry,
  deviceNames: Record<string, string>,
) => deviceNames[entry.device_id] ?? entry.device_id;

export const toLiveFaces = (
  entries: readonly RecognitionEntry[],
  deviceNames: Record<string, string>,
): RecentFace[] =>
  entries
    .filter((entry) => FACE_RECOGNIZERS.has(entry.recognizer))
    .slice(0, LIMIT)
    .map((entry) => ({
      id: `${entry.edgeId}:${entry.event_id}`,
      name: text(entry.result.person_name, "Unknown"),
      group: text(entry.result.person_group, "Unknown"),
      similarity:
        typeof entry.result.similarity === "number"
          ? entry.result.similarity
          : 0,
      device: deviceOf(entry, deviceNames),
      time: clock.format(Date.parse(entry.occurred_at)),
      visitor: entry.recognizer === "face_visitor_attendance",
    }));

export const toLivePlates = (
  entries: readonly RecognitionEntry[],
  deviceNames: Record<string, string>,
): RecentPlate[] =>
  entries
    .filter((entry) => PLATE_RECOGNIZERS.has(entry.recognizer))
    .slice(0, LIMIT)
    .map((entry) => {
      const type = text(entry.result.vehicle_type, "-");
      const color = text(entry.result.vehicle_color, "-");
      return {
        id: `${entry.edgeId}:${entry.event_id}`,
        plate: text(entry.result.plate_number, "-"),
        vehicle:
          type === "-"
            ? "Unknown vehicle"
            : `${color === "-" ? "" : `${titleCase(color)} `}${type}`,
        device: deviceOf(entry, deviceNames),
        time: clock.format(Date.parse(entry.occurred_at)),
      };
    });

import type { DetectionObject, DetectionStatus } from "../types";

type PpeFields = {
  ppe?: { status: string; missing?: string[] };
  missing_items?: string[];
};

export const statusOfPpe = ({
  ppe,
  missing_items,
}: PpeFields): DetectionStatus | null => {
  const missing = ppe?.missing ?? missing_items;
  if (missing && missing.length > 0) return "warning";
  if (!ppe) return missing ? "ok" : null;
  if (ppe.status === "violation") return "warning";
  return ppe.status === "unknown" ? "unknown" : "ok";
};

export const visibleObjects = (
  objects: readonly DetectionObject[],
  analyticId: string | null | undefined,
) =>
  analyticId?.startsWith("ppe_") || objects.some((object) => object.isPpe)
    ? objects.filter((object) => object.isPpe)
    : objects;

const ALERT_ANALYTICS = new Set([
  "fire_smoke",
  "cat_detection",
  "dust_spreading",
  "motion",
  "speed_violation",
]);

export const toneOf = (
  object: DetectionObject,
  analyticId: string | null | undefined,
) =>
  object.status === "warning" || object.status === "alert"
    ? "text-detect-red"
    : object.status === "ok"
      ? "text-detect-green"
      : analyticId && ALERT_ANALYTICS.has(analyticId)
        ? "text-detect-red"
        : "text-detect-blue";

export const STATUS_LABEL: Record<DetectionStatus, string> = {
  ok: "OK",
  warning: "Warning",
  alert: "Alert",
  unknown: "Measuring",
};

const seconds = (value: number) => `${Math.round(value)}s`;

export const detailOf = (object: DetectionObject) => {
  const parts: string[] = [];
  if (object.peopleCount !== null) {
    parts.push(
      object.peopleLimit === null
        ? `${object.peopleCount}`
        : `${object.peopleCount}/${object.peopleLimit}`,
    );
  }
  if (object.staySeconds !== null && object.staySeconds > 0) {
    parts.push(
      object.maxStaySeconds === null
        ? seconds(object.staySeconds)
        : `${seconds(object.staySeconds)}/${seconds(object.maxStaySeconds)}`,
    );
  }
  if (object.score !== null) parts.push(`${Math.round(object.score * 100)}%`);
  return parts.join(" · ");
};

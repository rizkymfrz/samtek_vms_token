import { statusOfPpe } from "./detection-status";
import type { DetectionObjectMessage } from "../schemas/edge-message";
import type { DetectionObject } from "../types";

export const toDetectionObject = (
  o: DetectionObjectMessage,
): DetectionObject => ({
  label: o.label,
  confidence: o.confidence,
  trackId: o.track_id ?? null,
  status: o.status ?? statusOfPpe(o) ?? (o.over_limit ? "alert" : null),
  missingItems: o.ppe?.missing ?? o.missing_items ?? null,
  isPpe: o.ppe !== undefined,
  score: o.score ?? null,
  peopleCount: o.people_count ?? null,
  peopleLimit: o.people_limit ?? null,
  staySeconds: o.stay_seconds ?? null,
  maxStaySeconds: o.max_stay_seconds ?? null,
  ...o.bbox,
});

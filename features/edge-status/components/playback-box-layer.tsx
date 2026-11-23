import { DetectionBox } from "./detection-box";
import { PoseSkeleton } from "./pose-skeleton";
import { visibleObjects } from "../lib/detection-status";
import { reasonLabel } from "../lib/playback-boxes";
import type { DetectionObject } from "../types";

export const PlaybackBoxLayer = ({
  objects,
  reason,
  analyticId,
}: {
  objects: readonly DetectionObject[];
  reason: string | null;
  analyticId?: string | null;
}) => (
  <div className="pointer-events-none absolute inset-0">
    {visibleObjects(objects, analyticId).map((object, index) => (
      <DetectionBox
        key={object.trackId || `i${index}`}
        object={object}
        analyticId={analyticId}
        isInstant
      />
    ))}
    {visibleObjects(objects, analyticId).map((object, index) => (
      <PoseSkeleton
        key={object.trackId || `i${index}`}
        object={object}
        analyticId={analyticId}
      />
    ))}
    {reason && (
      <span
        role="status"
        className="absolute top-2 left-2 border bg-background px-2 py-0.5 text-xs text-muted-foreground"
      >
        Boxes unavailable: {reasonLabel(reason)}
      </span>
    )}
  </div>
);

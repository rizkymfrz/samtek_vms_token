import { DetectionBox } from "./detection-box";
import { PoseSkeleton } from "./pose-skeleton";
import { visibleObjects } from "../lib/detection-status";
import type { DetectionObject } from "../types";

export const PlaybackBoxLayer = ({
  objects,
  analyticId,
}: {
  objects: readonly DetectionObject[];
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
  </div>
);

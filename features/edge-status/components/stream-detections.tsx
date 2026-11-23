"use client";
import { PentagonIcon, ScanEyeIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { ToolbarToggle } from "@/components/shared/toolbar-toggle";
import type { Perimeters } from "@/lib/api/perimeters";
import { DetectionBox } from "./detection-box";
import { hasPerimeters, PerimeterOverlay } from "./perimeter-overlay";
import { PoseSkeleton } from "./pose-skeleton";
import { useDetections } from "../hooks/use-detections";
import { visibleObjects } from "../lib/detection-status";

const DetectionOverlay = ({
  edgeId,
  deviceId,
  analyticId,
}: {
  edgeId: string;
  deviceId: string;
  analyticId: string | null | undefined;
}) => {
  const objects = useDetections(edgeId, deviceId);
  return (
    <div className="pointer-events-none absolute inset-0">
      {visibleObjects(objects, analyticId).map((object, index) => (
        <DetectionBox
          key={object.trackId || `i${index}`}
          object={object}
          analyticId={analyticId}
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
};

export const StreamDetections = ({
  edgeId,
  deviceId,
  analyticId,
  perimeters,
  isDefaultOn = false,
  trailing,
  children,
}: {
  edgeId: string;
  deviceId: string;
  analyticId?: string | null;
  perimeters?: Perimeters | null;
  isDefaultOn?: boolean;
  trailing?: ReactNode;
  children?: ReactNode;
}) => {
  const [hasDetections, setHasDetections] = useState(isDefaultOn);
  const [hasPerimeterLines, setHasPerimeterLines] = useState(false);
  return (
    <>
      {hasPerimeterLines && perimeters && (
        <PerimeterOverlay perimeters={perimeters} />
      )}
      {hasDetections && (
        <DetectionOverlay
          edgeId={edgeId}
          deviceId={deviceId}
          analyticId={analyticId}
        />
      )}
      <div className="absolute right-2 bottom-2 flex items-center gap-1 opacity-0 transition-opacity group-hover/tile:opacity-100 has-[:focus-visible]:opacity-100 has-data-[talk=live]:opacity-100">
        {children}
        {hasPerimeters(perimeters) && (
          <ToolbarToggle
            pressed={hasPerimeterLines}
            onPressedChange={setHasPerimeterLines}
            label="Perimeters"
          >
            <PentagonIcon />
          </ToolbarToggle>
        )}
        <ToolbarToggle
          pressed={hasDetections}
          onPressedChange={setHasDetections}
          label="Detections"
        >
          <ScanEyeIcon />
        </ToolbarToggle>
        {trailing}
      </div>
    </>
  );
};

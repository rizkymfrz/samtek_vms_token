"use client";
import { ScanEyeIcon } from "lucide-react";
import { useState } from "react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useDetections } from "../hooks/use-detections";
import type { DetectionObject } from "../types";

const TONES = [
  "text-chart-1 bg-chart-1/10 shadow-[0_0_12px_-2px_var(--chart-1)]",
  "text-chart-2 bg-chart-2/10 shadow-[0_0_12px_-2px_var(--chart-2)]",
  "text-chart-3 bg-chart-3/10 shadow-[0_0_12px_-2px_var(--chart-3)]",
  "text-chart-4 bg-chart-4/10 shadow-[0_0_12px_-2px_var(--chart-4)]",
  "text-chart-5 bg-chart-5/10 shadow-[0_0_12px_-2px_var(--chart-5)]",
];

const CORNERS = [
  "top-0 left-0 border-t-2 border-l-2",
  "top-0 right-0 border-t-2 border-r-2",
  "bottom-0 left-0 border-b-2 border-l-2",
  "right-0 bottom-0 border-r-2 border-b-2",
];

const toneOf = (label: string) => {
  let hash = 0;
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
};

const percent = (value: number) => `${value * 100}%`;

const Box = ({ object }: { object: DetectionObject }) => {
  const caption = `${object.label} ${Math.round(object.confidence * 100)}%`;
  return (
    <div
      className={cn(
        "absolute border border-current/30 transition-[left,top,width,height] duration-100 ease-linear",
        toneOf(object.label),
      )}
      style={{
        left: percent(object.x1),
        top: percent(object.y1),
        width: percent(object.x2 - object.x1),
        height: percent(object.y2 - object.y1),
      }}
    >
      {CORNERS.map((corner) => (
        <span
          key={corner}
          className={cn("absolute size-3 border-current", corner)}
        />
      ))}
      <span className="absolute bottom-full -left-px mb-0.5 flex max-w-full items-center gap-1 border-l-2 border-current bg-background/70 px-1.5 font-mono text-[10px] leading-4 tracking-wider text-current uppercase backdrop-blur-sm">
        {object.trackId !== null && (
          <span className="text-muted-foreground">
            {String(object.trackId).padStart(2, "0")}
          </span>
        )}
        <span className="truncate">{caption}</span>
      </span>
    </div>
  );
};

const DetectionOverlay = ({
  edgeId,
  deviceId,
}: {
  edgeId: string;
  deviceId: string;
}) => {
  const objects = useDetections(edgeId, deviceId);
  return (
    <div className="pointer-events-none absolute inset-0">
      {objects.map((object, index) => (
        <Box key={object.trackId ?? `i${index}`} object={object} />
      ))}
    </div>
  );
};

export const StreamDetections = ({
  edgeId,
  deviceId,
}: {
  edgeId: string;
  deviceId: string;
}) => {
  const [hasDetections, setHasDetections] = useState(false);
  return (
    <>
      {hasDetections && (
        <DetectionOverlay edgeId={edgeId} deviceId={deviceId} />
      )}
      <div className="absolute right-2 bottom-2 flex items-center rounded border bg-background opacity-0 transition-opacity group-hover/tile:opacity-100 focus-within:opacity-100">
        <Toggle
          size="sm"
          pressed={hasDetections}
          onPressedChange={setHasDetections}
          aria-label="Detections"
          title="Detections"
          className="aria-pressed:text-primary"
        >
          <ScanEyeIcon />
        </Toggle>
      </div>
    </>
  );
};

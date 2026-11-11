"use client";
import { ScanEyeIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

export const TileControls = ({
  hasDetections,
  onDetectionsChange,
}: {
  hasDetections: boolean;
  onDetectionsChange: (next: boolean) => void;
}) => (
  <div className="absolute right-2 bottom-2 flex items-center rounded border bg-background opacity-0 transition-opacity group-hover/tile:opacity-100 focus-within:opacity-100">
    <Toggle
      size="sm"
      pressed={hasDetections}
      onPressedChange={onDetectionsChange}
      aria-label="Detections"
      title="Detections"
      className="aria-pressed:text-primary"
    >
      <ScanEyeIcon />
    </Toggle>
  </div>
);

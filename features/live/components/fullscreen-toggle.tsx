"use client";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { ToolbarToggle } from "@/components/shared/toolbar-toggle";

export const FullscreenToggle = ({
  isFullscreen,
  onToggle,
}: {
  isFullscreen: boolean;
  onToggle: () => void;
}) => {
  return (
    <ToolbarToggle
      pressed={isFullscreen}
      onPressedChange={onToggle}
      label="Fullscreen"
    >
      {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
    </ToolbarToggle>
  );
};

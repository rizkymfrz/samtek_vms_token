"use client";
import { MoveIcon } from "lucide-react";
import { ToolbarToggle } from "@/components/shared/toolbar-toggle";
import { usePtzSupport } from "../hooks/use-ptz-support";
import { type PtzCamera, setPtzCamera, usePtzCamera } from "../lib/ptz-focus";

export const PtzToggle = (camera: PtzCamera) => {
  const isSupported = usePtzSupport(camera.edgeId, camera.deviceId);
  const active = usePtzCamera();
  if (!isSupported) return null;
  const isOn = active?.deviceId === camera.deviceId;
  return (
    <ToolbarToggle
      pressed={isOn}
      onPressedChange={(pressed) => setPtzCamera(pressed ? camera : null)}
      label="PTZ controls"
    >
      <MoveIcon />
    </ToolbarToggle>
  );
};

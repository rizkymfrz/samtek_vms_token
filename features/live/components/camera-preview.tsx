"use client";
import { CctvOffIcon, ServerOffIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreamDetections } from "@/features/edge-status";
import { WebrtcPlayer } from "./webrtc-player";
import { streamName } from "../lib/relay-url";

export type PreviewCamera = {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  state: "live" | "disabled" | "server-offline";
  hasSubStream: boolean;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
};

export const CameraPreview = ({
  camera,
  onClose,
}: {
  camera: PreviewCamera;
  onClose: () => void;
}) => {
  const Icon = camera.state === "disabled" ? CctvOffIcon : ServerOffIcon;
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b p-2">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-medium">{camera.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {camera.serverName}
          </span>
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Close ${camera.name}`}
          title="Close"
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </div>
      <div className="group/tile relative aspect-video overflow-hidden bg-sidebar">
        {camera.state === "live" ? (
          <>
            <WebrtcPlayer
              relay={camera}
              stream={streamName(camera.id, "sub", camera.hasSubStream)}
            />
            <StreamDetections
              edgeId={camera.serverId}
              deviceId={camera.id}
              isDefaultOn
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Icon className="size-8" />
            <span className="text-xs">
              {camera.state === "disabled"
                ? "Camera is disabled"
                : "Edge server is offline"}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

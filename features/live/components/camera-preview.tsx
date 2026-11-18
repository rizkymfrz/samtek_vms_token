"use client";
import { CctvOffIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EdgeOffline } from "@/components/shared/edge-offline";
import { StreamOffline } from "@/components/shared/stream-offline";
import { Button } from "@/components/ui/button";
import { StreamDetections } from "@/features/edge-status";
import { TalkControl } from "@/features/talk";
import { SpeakerToggle } from "./speaker-toggle";
import { WebrtcPlayer } from "./webrtc-player";
import { streamName } from "../lib/relay-url";

export type PreviewCamera = {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  analyticId?: string | null;
  state: "live" | "disabled" | "server-offline" | "stream-offline";
  hasSubStream: boolean;
  webrtcUrl: string | null;
  webrtcUrlLocal: string | null;
};

export const CameraPreview = ({
  camera,
  onClose,
  details,
}: {
  camera: PreviewCamera;
  onClose: () => void;
  details?: ReactNode;
}) => {
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
              audioId={camera.id}
            />
            <StreamDetections
              edgeId={camera.serverId}
              deviceId={camera.id}
              analyticId={camera.analyticId}
              isDefaultOn
            >
              <SpeakerToggle audioId={camera.id} />
              <TalkControl edgeId={camera.serverId} deviceId={camera.id} />
            </StreamDetections>
          </>
        ) : camera.state === "disabled" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <CctvOffIcon className="size-8" />
            <span className="text-xs">Camera is disabled</span>
          </div>
        ) : camera.state === "stream-offline" ? (
          <StreamOffline />
        ) : (
          <EdgeOffline />
        )}
      </div>
      {details}
    </>
  );
};

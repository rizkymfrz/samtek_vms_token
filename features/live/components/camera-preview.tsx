"use client";
import { CctvOffIcon, XIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { DeviceError } from "@/components/shared/device-error";
import { EdgeOffline } from "@/components/shared/edge-offline";
import { StreamOffline } from "@/components/shared/stream-offline";
import { Button } from "@/components/ui/button";
import { StreamDetections } from "@/features/edge-status";
import { TalkControl } from "@/features/talk";
import type { Perimeters } from "@/lib/api/perimeters";
import type { DeviceState } from "@/lib/device-state";
import { CameraDetailToggle } from "./camera-detail-toggle";
import { CameraWebToggle } from "./camera-web-toggle";
import { FullscreenToggle } from "./fullscreen-toggle";
import { SpeakerToggle } from "./speaker-toggle";
import { StreamQualityPick } from "./stream-quality-pick";
import { WebrtcPlayer } from "./webrtc-player";
import { useFullscreen } from "../hooks/use-fullscreen";
import { useStreamQuality } from "../hooks/use-stream-quality";
import { streamName } from "../lib/relay-url";

export type PreviewCamera = {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  analyticId?: string | null;
  state: DeviceState;
  hasSubStream: boolean;
  hasThirdStream: boolean;
  perimeters: Perimeters | null;
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
  const root = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(root);
  const { picked, pick } = useStreamQuality(camera.id, camera, "sub");
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
          title={`Close ${camera.name}`}
          onClick={onClose}
        >
          <XIcon />
        </Button>
      </div>
      <div
        ref={root}
        className="group/tile relative aspect-video overflow-hidden bg-sidebar [&:fullscreen]:aspect-auto"
      >
        {camera.state === "live" ? (
          <>
            <WebrtcPlayer
              relay={camera}
              stream={streamName(camera.id, picked, camera.hasSubStream)}
              audioId={camera.id}
            />
            <StreamDetections
              edgeId={camera.serverId}
              deviceId={camera.id}
              analyticId={camera.analyticId}
              perimeters={camera.perimeters}
              isDefaultOn
              trailing={
                <FullscreenToggle
                  isFullscreen={isFullscreen}
                  onToggle={toggle}
                />
              }
            >
              <SpeakerToggle audioId={camera.id} />
              <TalkControl edgeId={camera.serverId} deviceId={camera.id} />
              <CameraDetailToggle id={camera.id} tab="configuration" />
              <CameraWebToggle id={camera.id} />
              <StreamQualityPick
                streams={camera}
                value={picked}
                onChange={pick}
              />
            </StreamDetections>
          </>
        ) : camera.state === "disabled" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <CctvOffIcon className="size-8" />
            <span className="text-xs">Camera is disabled</span>
          </div>
        ) : camera.state === "stream-offline" ? (
          <StreamOffline />
        ) : camera.state === "device-error" ? (
          <DeviceError />
        ) : (
          <EdgeOffline isDisabled={camera.state === "server-disabled"} />
        )}
      </div>
      {details}
    </>
  );
};

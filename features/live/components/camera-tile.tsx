"use client";
import { CctvOffIcon } from "lucide-react";
import { useRef } from "react";
import { DeviceError } from "@/components/shared/device-error";
import { EdgeOffline } from "@/components/shared/edge-offline";
import { StatusDot } from "@/components/shared/status-dot";
import { StreamOffline } from "@/components/shared/stream-offline";
import { Badge } from "@/components/ui/badge";
import { StreamDetections } from "@/features/edge-status";
import { PtzPanel, PtzToggle } from "@/features/ptz";
import { TalkControl } from "@/features/talk";
import { usePersistedStore } from "@/hooks/use-persisted-store";
import { DEVICE_STATE_LABEL } from "@/lib/device-state";
import { cn } from "@/lib/utils";
import { CameraWebToggle } from "./camera-web-toggle";
import { FullscreenToggle } from "./fullscreen-toggle";
import { SpeakerToggle } from "./speaker-toggle";
import { StreamQualityPick } from "./stream-quality-pick";
import { WebrtcPlayer } from "./webrtc-player";
import { useFullscreen } from "../hooks/use-fullscreen";
import { streamName } from "../lib/relay-url";
import {
  setStreamPreference,
  streamPreferenceStore,
} from "../lib/stream-preference-store";
import { resolveQuality } from "../lib/stream-quality";
import type { StreamQuality, StreamState, Tile } from "../types";

const HINT: Record<StreamState, string | null> = {
  live: null,
  disabled: "Camera is disabled",
  "server-disabled": null,
  "server-offline": null,
  "stream-offline": null,
  "device-error": null,
};

export const CameraTile = ({
  tile,
  quality,
  className,
  hasPtz,
}: {
  tile: Tile;
  quality: StreamQuality;
  className?: string;
  hasPtz?: boolean;
}) => {
  const label = DEVICE_STATE_LABEL[tile.state];
  const hint = HINT[tile.state];
  const isLive = tile.state === "live";
  const root = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(root);
  const { status, value: preferences } = usePersistedStore(
    streamPreferenceStore,
  );
  const picked = resolveQuality(preferences.byDevice[tile.id], quality, tile);
  return (
    <div
      ref={root}
      role="group"
      aria-label={`${tile.name}, ${label}`}
      onDoubleClick={(event) => {
        if (
          isLive &&
          !(event.target as Element).closest("button, [role=slider]")
        )
          toggle();
      }}
      className={cn(
        "group/tile relative flex aspect-video w-full [&:fullscreen]:aspect-auto overflow-hidden border-r border-b bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="relative min-w-0 flex-1">
        {isLive ? (
          status === "ready" && (
            <WebrtcPlayer
              relay={tile}
              stream={streamName(tile.id, picked, tile.hasSubStream)}
              audioId={tile.id}
            />
          )
        ) : tile.state === "disabled" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <CctvOffIcon className="size-8" />
            <span className="text-xs">{hint}</span>
          </div>
        ) : tile.state === "stream-offline" ? (
          <StreamOffline />
        ) : tile.state === "device-error" ? (
          <DeviceError />
        ) : (
          <EdgeOffline isDisabled={tile.state === "server-disabled"} />
        )}
        {isLive && (
          <StreamDetections
            edgeId={tile.serverId}
            deviceId={tile.id}
            analyticId={tile.analyticId}
            perimeters={tile.perimeters}
            trailing={
              <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggle} />
            }
          >
            <SpeakerToggle audioId={tile.id} />
            <TalkControl edgeId={tile.serverId} deviceId={tile.id} />
            {hasPtz && (
              <PtzToggle
                edgeId={tile.serverId}
                deviceId={tile.id}
                name={tile.name}
              />
            )}
            <CameraWebToggle id={tile.id} />
            <StreamQualityPick
              streams={tile}
              value={picked}
              onChange={(next) =>
                streamPreferenceStore.update((state) =>
                  setStreamPreference(state, tile.id, next),
                )
              }
            />
          </StreamDetections>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
          <div className="ml-auto flex items-center gap-2">
            {tile.isPartial && isLive && (
              <Badge variant="overlay">
                <StatusDot status="caution" />
                Stream unavailable
              </Badge>
            )}
            {tile.isRecordingEnabled && (
              <Badge variant="overlay">
                <StatusDot status="danger" />
                REC
              </Badge>
            )}
          </div>
        </div>
        <Badge
          variant="overlay"
          className="absolute bottom-2 left-2 max-w-[calc(100%-4rem)] bg-background/70 text-sm backdrop-blur-md"
        >
          <span className="truncate">{tile.name}</span>
        </Badge>
      </div>
      {isFullscreen && hasPtz && <PtzPanel deviceId={tile.id} />}
    </div>
  );
};

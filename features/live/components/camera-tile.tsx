"use client";
import { CctvOffIcon, ServerOffIcon } from "lucide-react";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { StreamDetections } from "@/features/edge-status";
import { cn } from "@/lib/utils";
import { WebrtcPlayer } from "./webrtc-player";
import { streamName } from "../lib/relay-url";
import type { StreamQuality, StreamState, Tile } from "../types";

const STATE: Record<StreamState, { label: string; hint: string | null }> = {
  live: { label: "Live", hint: null },
  disabled: { label: "Disabled", hint: "Camera is disabled" },
  "server-offline": { label: "Offline", hint: "Edge server is offline" },
};

export const CameraTile = ({
  tile,
  quality,
  className,
}: {
  tile: Tile;
  quality: StreamQuality;
  className?: string;
}) => {
  const { label, hint } = STATE[tile.state];
  const Icon = tile.state === "disabled" ? CctvOffIcon : ServerOffIcon;
  const isLive = tile.state === "live";
  return (
    <div
      role="group"
      aria-label={`${tile.name}, ${label}`}
      className={cn(
        "group/tile relative aspect-video w-full overflow-hidden border-r border-b bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      {isLive ? (
        <WebrtcPlayer
          relay={tile}
          stream={streamName(tile.id, quality, tile.hasSubStream)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Icon className="size-8" />
          {hint && <span className="text-xs">{hint}</span>}
        </div>
      )}
      {isLive && <StreamDetections edgeId={tile.serverId} deviceId={tile.id} />}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <Badge variant="overlay">
          <StatusDot
            status={tile.state === "live" ? "live" : "offline"}
            className={cn(tile.state === "live" && "animate-pulse")}
          />
          {label}
        </Badge>
        <div className="flex items-center gap-2">
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
  );
};

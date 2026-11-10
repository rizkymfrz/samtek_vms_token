import { ServerOffIcon, VideoOffIcon } from "lucide-react";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DetectionOverlay } from "./detection-overlay";
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
  const Icon = tile.state === "disabled" ? VideoOffIcon : ServerOffIcon;
  const stream = quality === "sub" && tile.hasSubStream ? "sub" : "main";
  const isLive = tile.state === "live";
  return (
    <div
      role="group"
      aria-label={`${tile.name}, ${label}`}
      className={cn(
        "relative aspect-video w-full overflow-hidden border-r border-b bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      {isLive ? (
        <WebrtcPlayer
          relay={tile}
          stream={streamName(tile.deviceId, quality, tile.hasSubStream)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Icon className="size-8" />
          {hint && <span className="text-xs">{hint}</span>}
        </div>
      )}
      {isLive && tile.serverCode && (
        <DetectionOverlay edgeId={tile.serverCode} deviceId={tile.deviceId} />
      )}
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
          {tile.state === "live" && (
            <Badge
              variant="overlay"
              className="text-muted-foreground uppercase"
            >
              {stream}
            </Badge>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/80 to-transparent p-2">
        <span className="block truncate text-sm font-medium">{tile.name}</span>
      </div>
    </div>
  );
};

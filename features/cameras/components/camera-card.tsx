import { CctvIcon, CctvOffIcon } from "lucide-react";
import { EdgeOffline } from "@/components/shared/edge-offline";
import { MediaTile } from "@/components/shared/media-tile";
import { StatusDot } from "@/components/shared/status-dot";
import { StreamOffline } from "@/components/shared/stream-offline";
import { Badge } from "@/components/ui/badge";
import { Thumbnail } from "@/features/live";
import { STATE_LABEL } from "../lib/camera-state";
import type { StreamState } from "../types";

export const CameraCard = ({
  id,
  name,
  subtitle,
  state,
  recording,
  onSelect,
  className,
}: {
  id: string;
  name: string;
  subtitle: string;
  state: StreamState;
  recording: boolean;
  onSelect: () => void;
  className?: string;
}) => {
  const Icon = state === "live" ? CctvIcon : CctvOffIcon;
  return (
    <MediaTile
      label={`${name}, ${STATE_LABEL[state]}`}
      title={name}
      subtitle={subtitle}
      topEnd={
        recording && (
          <Badge variant="overlay">
            <StatusDot status="danger" />
            REC
          </Badge>
        )
      }
      onSelect={onSelect}
      className={className}
    >
      {state === "server-offline" ? (
        <EdgeOffline />
      ) : state === "stream-offline" ? (
        <StreamOffline />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <Icon className="size-8" />
        </div>
      )}
      {state !== "server-offline" && state !== "stream-offline" && (
        <Thumbnail id={id} />
      )}
    </MediaTile>
  );
};

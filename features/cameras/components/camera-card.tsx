import { CctvIcon, CctvOffIcon, ServerOffIcon } from "lucide-react";
import { MediaTile } from "@/components/shared/media-tile";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { STATE_LABEL } from "../lib/camera-state";
import type { StreamState } from "../types";

export const CameraCard = ({
  name,
  subtitle,
  state,
  recording,
  onSelect,
  className,
}: {
  name: string;
  subtitle: string;
  state: StreamState;
  recording: boolean;
  onSelect: () => void;
  className?: string;
}) => {
  const Icon =
    state === "live"
      ? CctvIcon
      : state === "disabled"
        ? CctvOffIcon
        : ServerOffIcon;
  return (
    <MediaTile
      label={`${name}, ${STATE_LABEL[state]}`}
      title={name}
      subtitle={subtitle}
      topStart={
        <Badge variant="overlay">
          <StatusDot status={state === "live" ? "live" : "offline"} />
          {STATE_LABEL[state]}
        </Badge>
      }
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
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        <Icon className="size-8" />
      </div>
    </MediaTile>
  );
};

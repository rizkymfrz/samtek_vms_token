import { ServerOffIcon, VideoIcon, VideoOffIcon } from "lucide-react";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
      ? VideoIcon
      : state === "disabled"
        ? VideoOffIcon
        : ServerOffIcon;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${name}, ${STATE_LABEL[state]}`}
      className={cn(
        "relative aspect-video w-full overflow-hidden border-r border-b bg-sidebar text-left text-sidebar-foreground outline-none hover:ring-2 hover:ring-ring hover:ring-inset focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        className,
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
        <Icon className="size-8" />
      </div>
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
        <Badge variant="overlay">
          <StatusDot status={state === "live" ? "live" : "offline"} />
          {STATE_LABEL[state]}
        </Badge>
        {recording && (
          <Badge variant="overlay">
            <StatusDot status="danger" />
            REC
          </Badge>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-2">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      </div>
    </button>
  );
};

import { PauseIcon, RotateCcwIcon, ScanEyeIcon } from "lucide-react";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StreamDetections } from "@/features/edge-status";
import { PtzControls } from "./ptz-controls";
import { StreamFrame } from "./stream-frame";
import type { CameraDetail, StreamState } from "../types";

export const LivePanel = ({
  detail,
  state,
}: {
  detail: CameraDetail;
  state: StreamState;
}) => {
  const isLive = state === "live";
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Live View</h2>
        <p className="text-xs text-muted-foreground">
          The main stream of this camera, as the edge server relays it.
        </p>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1">
          <PauseIcon />
          Pause Live View
        </Button>
        <Button variant="secondary" className="flex-1">
          <RotateCcwIcon />
          Restart Camera
        </Button>
        <Button variant="destructive" className="flex-1">
          <ScanEyeIcon />
          Pause Analytics
        </Button>
      </div>
      <div className="group/tile relative aspect-video w-full overflow-hidden border bg-sidebar">
        <StreamFrame detail={detail} state={state} quality="main" />
        {isLive && (
          <StreamDetections edgeId={detail.edgeServerId} deviceId={detail.id} />
        )}
        {!isLive && (
          <Badge variant="overlay" className="absolute top-2 left-2">
            <StatusDot status="offline" />
            Offline
          </Badge>
        )}
      </div>
      <PtzControls />
    </section>
  );
};

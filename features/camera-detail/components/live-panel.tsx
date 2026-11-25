"use client";
import { PauseIcon, RotateCcwIcon, ScanEyeIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { StreamDetections } from "@/features/edge-status";
import {
  CameraWebToggle,
  FullscreenToggle,
  SpeakerToggle,
  StreamQualityPick,
  useFullscreen,
  useStreamQuality,
} from "@/features/live";
import { PtzControls } from "@/features/ptz";
import { TalkControl } from "@/features/talk";
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
  const root = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(root);
  const streams = {
    hasSubStream: detail.hasSubStream,
    hasThirdStream: detail.sourceThird !== null,
  };
  const { picked, pick } = useStreamQuality(detail.id, streams, "main");
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Live view</h2>
        <p className="text-xs text-muted-foreground">
          The main stream of this camera, as the edge server relays it.
        </p>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1">
          <PauseIcon />
          Pause live view
        </Button>
        <Button variant="secondary" className="flex-1">
          <RotateCcwIcon />
          Restart camera
        </Button>
        <Button variant="destructive" className="flex-1">
          <ScanEyeIcon />
          Pause analytics
        </Button>
      </div>
      <div
        ref={root}
        className="group/tile relative aspect-video w-full overflow-hidden border bg-sidebar [&:fullscreen]:aspect-auto"
      >
        <StreamFrame detail={detail} state={state} quality={picked} hasAudio />
        {isLive && (
          <StreamDetections
            edgeId={detail.edgeServerId}
            deviceId={detail.id}
            analyticId={detail.analyticId}
            perimeters={detail.perimeters}
            trailing={
              <FullscreenToggle isFullscreen={isFullscreen} onToggle={toggle} />
            }
          >
            <SpeakerToggle audioId={detail.id} />
            <TalkControl edgeId={detail.edgeServerId} deviceId={detail.id} />
            <CameraWebToggle id={detail.id} />
            <StreamQualityPick
              streams={streams}
              value={picked}
              onChange={pick}
            />
          </StreamDetections>
        )}
      </div>
      <PtzControls edgeId={detail.edgeServerId} deviceId={detail.id} />
    </section>
  );
};

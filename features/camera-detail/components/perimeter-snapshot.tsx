"use client";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Thumbnail, useThumbnail } from "@/features/live";
import { StreamFrame } from "./stream-frame";
import type { CameraDetail, StreamState } from "../types";

export const PerimeterSnapshot = ({
  detail,
  state,
}: {
  detail: CameraDetail;
  state: StreamState;
}) => {
  const thumbnail = useThumbnail(detail.id);
  const [since, setSince] = useState<number | null>(null);
  const isLive = state === "live";
  const isCapturing =
    isLive && (!thumbnail || (since !== null && thumbnail.at <= since));
  if (!thumbnail && !isCapturing) {
    return <StreamFrame detail={detail} state={state} quality="sub" />;
  }
  return (
    <>
      <Thumbnail id={detail.id} />
      {isCapturing && (
        <>
          <div className="invisible absolute inset-0">
            <StreamFrame
              detail={detail}
              state={state}
              quality="sub"
              isCapturing
            />
          </div>
          {!thumbnail && (
            <div className="absolute inset-0 flex items-center justify-center bg-sidebar text-muted-foreground">
              <Loader2Icon className="size-8 animate-spin" />
            </div>
          )}
        </>
      )}
      {isLive && (
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Update snapshot"
          title="Update snapshot"
          disabled={isCapturing}
          className="absolute top-2 right-2"
          onClick={() => setSince(Date.now())}
        >
          {isCapturing ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <CameraIcon />
          )}
        </Button>
      )}
    </>
  );
};

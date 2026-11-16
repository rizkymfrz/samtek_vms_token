"use client";
import { Loader2Icon } from "lucide-react";
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
  if (thumbnail) return <Thumbnail id={detail.id} />;
  if (state !== "live") {
    return <StreamFrame detail={detail} state={state} quality="sub" />;
  }
  return (
    <>
      <div className="invisible absolute inset-0">
        <StreamFrame detail={detail} state={state} quality="sub" isCapturing />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-sidebar text-muted-foreground">
        <Loader2Icon className="size-8 animate-spin" />
      </div>
    </>
  );
};

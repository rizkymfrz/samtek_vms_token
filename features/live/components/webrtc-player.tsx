"use client";
import {
  Loader2Icon,
  VideoOffIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWebrtcStream } from "../hooks/use-webrtc-stream";

const HINT = {
  connecting: "Connecting…",
  reconnecting: "Reconnecting…",
  unavailable: "Stream address is not available",
  playing: null,
} as const;

export const WebrtcPlayer = ({
  relay,
  stream,
  app = "live",
  isSeamless = false,
  isPaused = false,
  withAudio = false,
}: {
  relay: { webrtcUrl: string | null; webrtcUrlLocal: string | null };
  stream: string;
  app?: string;
  isSeamless?: boolean;
  isPaused?: boolean;
  withAudio?: boolean;
}) => {
  const { videoRef, status } = useWebrtcStream(
    relay,
    stream,
    app,
    isSeamless,
    isPaused,
    withAudio,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hint = HINT[status];
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (isPaused) {
      if (!video.videoWidth) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      setIsFrozen(true);
      return;
    }
    if (!("requestVideoFrameCallback" in video)) {
      setIsFrozen(false);
      return;
    }
    const handle = video.requestVideoFrameCallback(() => setIsFrozen(false));
    return () => video.cancelVideoFrameCallback(handle);
  }, [isPaused, videoRef]);
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted, videoRef]);
  const isHolding = isSeamless && status === "reconnecting";
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        aria-label={stream}
        className="absolute inset-0 size-full bg-background object-fill"
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "absolute inset-0 size-full bg-background object-fill",
          !isFrozen && "hidden",
        )}
      />
      {withAudio && status === "playing" && (
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="absolute right-2 bottom-2"
          onClick={() => setIsMuted((muted) => !muted)}
        >
          {isMuted ? <VolumeXIcon /> : <Volume2Icon />}
        </Button>
      )}
      {isHolding && (
        <Loader2Icon className="absolute top-2 right-2 size-4 animate-spin text-muted-foreground" />
      )}
      {hint && !isHolding && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sidebar text-muted-foreground">
          {status === "unavailable" ? (
            <VideoOffIcon className="size-8" />
          ) : (
            <Loader2Icon className="size-8 animate-spin" />
          )}
          <span className="text-xs">{hint}</span>
        </div>
      )}
    </>
  );
};

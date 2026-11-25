"use client";
import {
  Loader2Icon,
  VideoOffIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { captureFrame, saveThumbnail } from "@/lib/storage/thumbnail-store";
import { cn } from "@/lib/utils";
import { useAudioFocus } from "../hooks/use-audio-focus";
import { useWebrtcStream } from "../hooks/use-webrtc-stream";
import { releaseAudio, setAudioAvailable } from "../lib/audio-focus";

const FIRST_CAPTURE_MS = 1500;
const CAPTURE_EVERY_MS = 5 * 60 * 1000;

const HINT = {
  connecting: "Connecting…",
  reconnecting: "Reconnecting…",
  unavailable: "Stream unavailable",
  playing: null,
} as const;

export const WebrtcPlayer = ({
  relay,
  stream,
  app = "live",
  isSeamless = false,
  isQuiet = false,
  isPaused = false,
  withAudio = false,
  audioId,
  thumbnailId,
  onFrame,
  isTimed = false,
  onFrameTime,
}: {
  relay: { webrtcUrl: string | null; webrtcUrlLocal: string | null };
  stream: string;
  app?: string;
  isSeamless?: boolean;
  isQuiet?: boolean;
  isPaused?: boolean;
  withAudio?: boolean;
  audioId?: string;
  thumbnailId?: string;
  onFrame?: (at: number) => void;
  isTimed?: boolean;
  onFrameTime?: (wallMs: number | null) => void;
}) => {
  const { activeId } = useAudioFocus();
  const onAudio = useCallback(
    (hasAudio: boolean) => {
      if (audioId !== undefined) setAudioAvailable(audioId, hasAudio);
    },
    [audioId],
  );
  const { videoRef, status, frameTimeOf } = useWebrtcStream(
    relay,
    stream,
    app,
    isSeamless,
    isPaused,
    withAudio || audioId !== undefined,
    onAudio,
    isTimed,
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hint = HINT[status];
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onFrame || !("requestVideoFrameCallback" in video)) return;
    const onTick = (at: number) => {
      onFrame(at);
      handle = video.requestVideoFrameCallback(onTick);
    };
    let handle = video.requestVideoFrameCallback(onTick);
    return () => video.cancelVideoFrameCallback(handle);
  }, [onFrame, videoRef]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onFrameTime || !("requestVideoFrameCallback" in video))
      return;
    const onTick = (
      _at: number,
      metadata: VideoFrameCallbackMetadata & { rtpTimestamp?: number },
    ) => {
      const { rtpTimestamp } = metadata;
      onFrameTime(
        rtpTimestamp === undefined ? null : frameTimeOf(rtpTimestamp),
      );
      handle = video.requestVideoFrameCallback(onTick);
    };
    let handle = video.requestVideoFrameCallback(onTick);
    return () => video.cancelVideoFrameCallback(handle);
  }, [onFrameTime, frameTimeOf, videoRef]);
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
    if (videoRef.current) {
      videoRef.current.muted =
        audioId === undefined ? isMuted : activeId !== audioId;
    }
  }, [isMuted, audioId, activeId, videoRef]);
  useEffect(() => {
    const video = videoRef.current;
    if (!thumbnailId || !video || status !== "playing") return;
    const capture = async () => {
      const blob = await captureFrame(video);
      if (blob) await saveThumbnail(thumbnailId, blob);
    };
    const run = () => {
      capture().catch((error: unknown) => {
        console.warn(`[thumbnail] ${thumbnailId}: could not save`, error);
      });
    };
    const first = setTimeout(run, FIRST_CAPTURE_MS);
    const every = setInterval(run, CAPTURE_EVERY_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [thumbnailId, status, videoRef]);
  useEffect(
    () => () => {
      if (audioId === undefined) return;
      releaseAudio(audioId);
    },
    [audioId],
  );
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
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          className="absolute right-2 bottom-2"
          onClick={() => setIsMuted((muted) => !muted)}
        >
          {isMuted ? <VolumeXIcon /> : <Volume2Icon />}
        </Button>
      )}
      {isHolding && !isQuiet && (
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

"use client";
import { Loader2Icon, VideoOffIcon } from "lucide-react";
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
}: {
  relay: { webrtcUrl: string | null; webrtcUrlLocal: string | null };
  stream: string;
}) => {
  const { videoRef, status } = useWebrtcStream(relay, stream);
  const hint = HINT[status];
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
      {hint && (
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

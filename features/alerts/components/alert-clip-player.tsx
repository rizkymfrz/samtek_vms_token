"use client";
import { WebrtcPlayer } from "@/features/live";
import { useClipSession } from "../hooks/use-clip-session";
import type { AlertClip } from "../types";

export const AlertClipPlayer = ({ clip }: { clip: AlertClip }) => {
  const { session, error } = useClipSession(clip.edgeId, clip.eventId);
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border bg-sidebar text-xs text-muted-foreground">
      {error ? (
        <span role="alert" className="px-4 text-center">
          {error}
        </span>
      ) : session?.state === "ended" ? (
        <span>End of clip</span>
      ) : session ? (
        <WebrtcPlayer
          relay={clip.relay}
          app={session.app}
          stream={session.stream}
          isSeamless
          withAudio
        />
      ) : (
        <span>Loading clip…</span>
      )}
    </div>
  );
};

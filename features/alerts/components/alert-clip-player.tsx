"use client";
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { stepSpeed } from "@/features/camera-detail/lib/recording-timeline";
import { WebrtcPlayer } from "@/features/live";
import { useClipSession } from "../hooks/use-clip-session";
import type { AlertClip } from "../types";

const SEEK_MS = 10_000;
const SEGMENTS = 40;

const formatElapsed = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

export const AlertClipPlayer = ({ clip }: { clip: AlertClip }) => {
  const {
    session,
    error,
    isBusy,
    elapsed,
    onFrame,
    seekBy,
    seekTo,
    pause,
    resume,
    changeSpeed,
  } = useClipSession(clip.edgeId, clip.eventId, clip.startAt);
  const isPlaying = session?.state === "playing";
  const isPaused = session?.state === "paused";
  const isEnded = session?.state === "ended";
  const canControl = !!session && !isEnded && !isBusy;
  const duration = clip.durationMs;
  const shown = Math.min(elapsed ?? 0, duration ?? Infinity);
  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border bg-sidebar text-xs text-muted-foreground">
        {error ? (
          <span role="alert" className="px-4 text-center">
            {error}
          </span>
        ) : session ? (
          <>
            <WebrtcPlayer
              relay={clip.relay}
              app={session.app}
              stream={session.stream}
              isSeamless
              isQuiet
              withAudio
              isPaused={isPaused}
              onFrame={onFrame}
            />
          </>
        ) : (
          <span>Loading clip…</span>
        )}
      </div>
      {duration !== null && duration > 0 && (
        <button
          type="button"
          aria-label="Seek clip"
          disabled={!canControl}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - rect.left) / rect.width;
            void seekTo(Math.min(1, Math.max(0, ratio)) * duration);
          }}
          className="relative flex h-4 w-full gap-0.5 disabled:opacity-50"
        >
          {Array.from({ length: SEGMENTS }, (_, segment) => (
            <span
              key={segment}
              data-played={
                segment < Math.round((shown / duration) * SEGMENTS)
                  ? ""
                  : undefined
              }
              className="h-full flex-1 rounded-[1px] bg-muted data-played:bg-primary"
            />
          ))}
          <span
            className="absolute -inset-y-1 w-0.5 bg-foreground"
            style={{ left: `${(shown / duration) * 100}%` }}
          />
        </button>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          aria-label="Back 10 seconds"
          disabled={!canControl}
          onClick={() => void seekBy(-SEEK_MS)}
        >
          <SkipBackIcon />
        </Button>
        <Button
          size="icon"
          aria-label={isPlaying ? "Pause" : "Play"}
          disabled={!canControl || !(isPlaying || isPaused)}
          onClick={() => void (isPlaying ? pause() : resume())}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Rewind"
          disabled={!canControl}
          onClick={() => void changeSpeed(stepSpeed(session?.speed ?? 1, -1))}
        >
          <RewindIcon />
        </Button>
        <span className="flex size-10 items-center justify-center rounded border bg-card text-xs tabular-nums">
          {session?.speed ?? 1}
        </span>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Fast forward"
          disabled={!canControl}
          onClick={() => void changeSpeed(stepSpeed(session?.speed ?? 1, 1))}
        >
          <FastForwardIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Forward 10 seconds"
          disabled={!canControl}
          onClick={() => void seekBy(SEEK_MS)}
        >
          <SkipForwardIcon />
        </Button>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {formatElapsed(shown)}
          {!!duration && ` / ${formatElapsed(duration)}`}
        </span>
      </div>
    </div>
  );
};

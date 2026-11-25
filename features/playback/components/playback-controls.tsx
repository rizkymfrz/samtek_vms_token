import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  nextRangeStart,
  previousRangeStart,
  stepSpeed,
} from "@/features/camera-detail/playback";
import type { RecordingRange } from "@/features/edge-status";
import type { PlaybackClock } from "../hooks/use-playback-clock";

export const PlaybackControls = ({
  clock,
  ranges,
  isDisabled,
}: {
  clock: PlaybackClock;
  ranges: RecordingRange[];
  isDisabled: boolean;
}) => {
  const { position, isPlaying, speed } = clock;
  const hasPosition = position !== null;
  const playFrom = (time: number | null) => {
    if (time !== null) clock.seek(time);
  };
  const onPlay = () => {
    if (isPlaying) clock.pause();
    else if (hasPosition) clock.resume();
    else playFrom(ranges[0]?.from ?? null);
  };
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="icon"
        aria-label="Previous clip"
        disabled={isDisabled || !hasPosition}
        onClick={() => playFrom(previousRangeStart(ranges, position ?? 0))}
      >
        <SkipBackIcon />
      </Button>
      <Button
        size="icon"
        aria-label={isPlaying ? "Pause" : "Play"}
        disabled={
          isDisabled || (!isPlaying && !hasPosition && ranges.length === 0)
        }
        onClick={onPlay}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Slower"
        disabled={isDisabled || !hasPosition}
        onClick={() => clock.setSpeed(stepSpeed(speed, -1))}
      >
        <RewindIcon />
      </Button>
      <span className="flex size-10 items-center justify-center rounded border bg-card text-xs tabular-nums">
        {speed}x
      </span>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Faster"
        disabled={isDisabled || !hasPosition}
        onClick={() => clock.setSpeed(stepSpeed(speed, 1))}
      >
        <FastForwardIcon />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Next clip"
        disabled={isDisabled || !hasPosition}
        onClick={() => playFrom(nextRangeStart(ranges, position ?? 0))}
      >
        <SkipForwardIcon />
      </Button>
    </div>
  );
};

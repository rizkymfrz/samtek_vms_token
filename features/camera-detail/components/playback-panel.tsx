import { isSameDay } from "date-fns";
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  ServerOffIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { type MouseEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  type PlaybackSession,
  useRecordingDevice,
} from "@/features/edge-status";
import { WebrtcPlayer } from "@/features/live";
import { cn } from "@/lib/utils";
import { usePlaybackSession } from "../hooks/use-playback-session";
import { useRecordingRanges } from "../hooks/use-recording-ranges";
import {
  dayBounds,
  extendToNewest,
  nextRangeStart,
  previousRangeStart,
  snapToRange,
  stepSpeed,
  toBars,
} from "../lib/recording-timeline";
import type { CameraDetail } from "../types";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;
const LABEL_STEP = 3;
const SEGMENT_MINUTES = 15;
const SEGMENT_COUNT = MINUTES_PER_DAY / SEGMENT_MINUTES;

const LABEL_HOURS = Array.from(
  { length: HOURS_PER_DAY / LABEL_STEP + 1 },
  (_, index) => index * LABEL_STEP,
);

const toPercent = (minute: number) => `${(minute / MINUTES_PER_DAY) * 100}%`;

const labelShift = (hour: number) =>
  hour === 0
    ? "translate-x-0"
    : hour === HOURS_PER_DAY
      ? "-translate-x-full"
      : "-translate-x-1/2";

type Bar = { startMinute: number; endMinute: number };

const Timeline = ({
  bars,
  playheadMinute,
  onSeek,
}: {
  bars: Bar[];
  playheadMinute: number | null;
  onSeek: (minute: number) => void;
}) => {
  const seekAt = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onSeek(((event.clientX - rect.left) / rect.width) * MINUTES_PER_DAY);
  };
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-label="Seek recording timeline"
        onClick={seekAt}
        className="relative flex h-8 w-full gap-0.5"
      >
        {Array.from({ length: SEGMENT_COUNT }, (_, segment) => {
          const start = segment * SEGMENT_MINUTES;
          const end = start + SEGMENT_MINUTES;
          const isRecorded = bars.some(
            (bar) => bar.startMinute < end && bar.endMinute > start,
          );
          return (
            <span
              key={segment}
              data-recorded={isRecorded ? "" : undefined}
              className="h-full flex-1 rounded-[1px] bg-muted data-recorded:bg-chart-3"
            />
          );
        })}
        {playheadMinute !== null &&
          playheadMinute >= 0 &&
          playheadMinute <= MINUTES_PER_DAY && (
            <span
              className="absolute -inset-y-1 w-0.5 bg-foreground"
              style={{ left: toPercent(playheadMinute) }}
            />
          )}
      </button>
      <div className="relative h-4">
        {LABEL_HOURS.map((hour) => (
          <span
            key={hour}
            className={cn(
              "absolute top-0 text-xs text-muted-foreground tabular-nums",
              labelShift(hour),
            )}
            style={{ left: toPercent(hour * MINUTES_PER_HOUR) }}
          >
            {String(hour).padStart(2, "0")}:00
          </span>
        ))}
      </div>
    </div>
  );
};

const PlaybackScreen = ({
  detail,
  session,
  error,
  isOnline,
}: {
  detail: CameraDetail;
  session: PlaybackSession | null;
  error: string | null;
  isOnline: boolean;
}) => {
  if (!isOnline) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <ServerOffIcon className="size-8" />
        <span>Edge server is offline</span>
      </div>
    );
  }
  if (error) {
    return (
      <span role="alert" className="px-4 text-center">
        {error}
      </span>
    );
  }
  if (!session) return <span>Select a time on the timeline to play.</span>;
  if (session.state === "ended") return <span>End of recording</span>;
  const isPaused = session.state === "paused";
  return (
    <>
      <WebrtcPlayer
        relay={detail}
        app={session.app}
        stream={session.stream}
        isSeamless
        isPaused={isPaused}
      />
    </>
  );
};

export const PlaybackPanel = ({
  detail,
  isOnline,
}: {
  detail: CameraDetail;
  isOnline: boolean;
}) => {
  const [applied, setApplied] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | undefined>(applied);
  const canApply = selected !== undefined && !isSameDay(selected, applied);
  const device = useRecordingDevice(detail.edgeServerId, detail.id);
  const stream = detail.hasSubStream ? "sub" : "main";
  const query = useRecordingRanges(
    detail.edgeServerId,
    detail.id,
    stream,
    applied,
    isOnline,
  );
  const playback = usePlaybackSession(detail.edgeServerId, detail.id, stream);
  const { from, to } = dayBounds(applied);
  const ranges = extendToNewest(
    query.data?.ranges ?? [],
    device?.newestAt ?? null,
    to.getTime(),
  );
  const { session, position } = playback;
  const isPlaying = session?.state === "playing";
  const canControl = isOnline && !playback.isBusy;
  const playFrom = (time: number | null) => {
    if (time !== null) void playback.seek(new Date(time));
  };
  const onPlay = () => {
    if (session?.state === "paused") void playback.resume();
    else
      playFrom(
        session?.state === "ended" ? position : (ranges[0]?.from ?? null),
      );
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border bg-sidebar text-xs text-muted-foreground">
            <PlaybackScreen
              detail={detail}
              session={session}
              error={playback.error}
              isOnline={isOnline}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Previous clip"
              disabled={!canControl || position === null}
              onClick={() =>
                playFrom(previousRangeStart(ranges, position ?? 0))
              }
            >
              <SkipBackIcon />
            </Button>
            <Button
              size="icon"
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={!canControl || (!isPlaying && ranges.length === 0)}
              onClick={() => void (isPlaying ? playback.pause() : onPlay())}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Rewind"
              disabled={!canControl || !session}
              onClick={() =>
                void playback.changeSpeed(stepSpeed(session?.speed ?? 1, -1))
              }
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
              disabled={!canControl || !session}
              onClick={() =>
                void playback.changeSpeed(stepSpeed(session?.speed ?? 1, 1))
              }
            >
              <FastForwardIcon />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Next clip"
              disabled={!canControl || position === null}
              onClick={() => playFrom(nextRangeStart(ranges, position ?? 0))}
            >
              <SkipForwardIcon />
            </Button>
          </div>
        </section>
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-2 rounded border bg-card p-2">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              defaultMonth={applied}
              className="bg-transparent"
              classNames={{ root: "w-full" }}
            />
            <div className="flex border-t pt-2">
              <Button
                className="flex-1"
                disabled={!canApply}
                onClick={() => {
                  if (!selected) return;
                  void playback.stop();
                  setApplied(selected);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Timeline
        bars={toBars(ranges, from.getTime())}
        playheadMinute={
          position === null ? null : (position - from.getTime()) / MS_PER_MINUTE
        }
        onSeek={(minute) =>
          playFrom(
            isOnline
              ? snapToRange(ranges, from.getTime() + minute * MS_PER_MINUTE)
              : null,
          )
        }
      />
    </div>
  );
};

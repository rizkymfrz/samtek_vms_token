import { isSameDay } from "date-fns";
import {
  BellIcon,
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  SignalIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { useState } from "react";
import { EdgeOffline } from "@/components/shared/edge-offline";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAlertMarkers } from "@/features/alerts";
import {
  PlaybackBoxLayer,
  type PlaybackSession,
  usePlaybackBoxes,
  useRecordingDevice,
} from "@/features/edge-status";
import { SpeakerToggle, WebrtcPlayer } from "@/features/live";
import { PlaybackTimeline } from "./playback-timeline";
import { usePlaybackSession } from "../hooks/use-playback-session";
import { useRecordingRanges } from "../hooks/use-recording-ranges";
import {
  dayBounds,
  extendToNewest,
  nextRangeStart,
  previousRangeStart,
  snapToRange,
  stepSpeed,
} from "../lib/recording-timeline";
import type { CameraDetail } from "../types";

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
  const boxes = usePlaybackBoxes(session?.sessionId ?? null);
  if (!isOnline) return <EdgeOffline />;
  if (error) {
    return (
      <span role="alert" className="px-4 text-center">
        {error}
      </span>
    );
  }
  if (!session) return <span>Select a time on the timeline to play.</span>;
  if (session.state === "ended") return <span>End of recording.</span>;
  const isPaused = session.state === "paused";
  return (
    <>
      <WebrtcPlayer
        relay={detail}
        app={session.app}
        stream={session.stream}
        isSeamless
        isPaused={isPaused}
        audioId={`${detail.id}:playback`}
        isTimed={boxes.isTimed}
        onFrameTime={boxes.onFrameTime}
      />
      <PlaybackBoxLayer
        objects={boxes.objects}
        analyticId={detail.analyticId}
      />
      <div className="absolute right-2 bottom-2 flex items-center rounded border bg-background">
        <SpeakerToggle audioId={`${detail.id}:playback`} />
      </div>
    </>
  );
};

const STREAM_ITEMS = [
  { value: "sub", label: "Sub stream" },
  { value: "main", label: "Main stream" },
];

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
  const [preferred, setPreferred] = useState<"sub" | "main">("sub");
  const stream = detail.hasSubStream ? preferred : "main";
  const query = useRecordingRanges(
    detail.edgeServerId,
    detail.id,
    stream,
    applied,
    isOnline,
  );
  const playback = usePlaybackSession(detail.edgeServerId, detail.id, stream);
  const alertMarkers = useAlertMarkers(applied, [detail.name]);
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Previous clip"
            disabled={!canControl || position === null}
            onClick={() => playFrom(previousRangeStart(ranges, position ?? 0))}
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
            aria-label="Slower"
            disabled={!canControl || !session}
            onClick={() =>
              void playback.changeSpeed(stepSpeed(session?.speed ?? 1, -1))
            }
          >
            <RewindIcon />
          </Button>
          <span className="flex size-10 items-center justify-center rounded border bg-card text-xs tabular-nums">
            {session?.speed ?? 1}x
          </span>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Faster"
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
        <div className="ml-auto flex items-center gap-2">
          {detail.hasSubStream && (
            <Pick
              label="Stream quality"
              icon={SignalIcon}
              items={STREAM_ITEMS}
              value={stream}
              onChange={(next) => {
                void playback.stop();
                setPreferred(next as "sub" | "main");
              }}
            />
          )}
          <Pick
            label="Alarm type"
            icon={BellIcon}
            items={alertMarkers.items}
            value={alertMarkers.value}
            onChange={alertMarkers.onChange}
          />
        </div>
      </div>
      <PlaybackTimeline
        key={from.getTime()}
        ranges={ranges}
        markers={alertMarkers.markers}
        dayStart={from.getTime()}
        dayEnd={to.getTime()}
        position={position}
        onSeek={(time) => playFrom(isOnline ? snapToRange(ranges, time) : null)}
      />
    </div>
  );
};

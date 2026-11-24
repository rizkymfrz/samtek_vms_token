"use client";
import { useCallback, useEffect, useRef } from "react";
import { EdgeOffline } from "@/components/shared/edge-offline";
import { Badge } from "@/components/ui/badge";
import {
  PlaybackTimeline,
  snapToRange,
  usePlaybackSession,
} from "@/features/camera-detail/playback";
import {
  PlaybackBoxLayer,
  type PlaybackSession,
  type RecordingRange,
  type RecordingStream,
  usePlaybackBoxes,
} from "@/features/edge-status";
import {
  SpeakerToggle,
  type Tile,
  useFullscreen,
  WebrtcPlayer,
} from "@/features/live";
import { cn } from "@/lib/utils";
import { PlaybackControls } from "./playback-controls";
import {
  type ClockCommand,
  type ClockReading,
  type PlaybackClock,
  usePlaybackClock,
} from "../hooks/use-playback-clock";
import { isCovered } from "../lib/merge-ranges";

const PlaybackScreen = ({
  tile,
  session,
  error,
  hasPosition,
}: {
  tile: Tile;
  session: PlaybackSession | null;
  error: string | null;
  hasPosition: boolean;
}) => {
  const boxes = usePlaybackBoxes(session?.sessionId ?? null);
  if (tile.state === "server-offline") return <EdgeOffline />;
  if (error) {
    return (
      <span role="alert" className="px-4 text-center">
        {error}
      </span>
    );
  }
  if (!session) {
    return (
      <span>
        {hasPosition
          ? "No recording at this time"
          : "Select a time on the timeline to play."}
      </span>
    );
  }
  if (session.state === "ended") return <span>End of recording</span>;
  return (
    <>
      <WebrtcPlayer
        relay={tile}
        app={session.app}
        stream={session.stream}
        isSeamless
        isPaused={session.state === "paused"}
        audioId={`${tile.id}:playback`}
        isTimed={boxes.isTimed}
        onFrameTime={boxes.onFrameTime}
      />
      <PlaybackBoxLayer
        objects={boxes.objects}
        analyticId={tile.analyticId}
      />
    </>
  );
};

export const PlaybackTile = ({
  tile,
  stream,
  ranges,
  clock,
  dayStart,
  dayEnd,
  className,
}: {
  tile: Tile;
  stream: RecordingStream;
  ranges: RecordingRange[];
  clock: PlaybackClock;
  dayStart: number;
  dayEnd: number;
  className?: string;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle } = useFullscreen(root);
  const local = usePlaybackClock();
  const playback = usePlaybackSession(tile.serverId, tile.id, stream);
  const { seek, pause, resume, changeSpeed, stop } = playback;
  const latest = useRef({ ranges, session: playback.session });
  useEffect(() => {
    latest.current = { ranges, session: playback.session };
  });
  const playAt = useCallback(
    async ({ position, isPlaying, speed }: ClockReading) => {
      if (position === null || !isCovered(latest.current.ranges, position)) {
        await stop();
        return;
      }
      await seek(new Date(position));
      if (speed !== 1) await changeSpeed(speed);
      if (!isPlaying) await pause();
    },
    [seek, stop, changeSpeed, pause],
  );
  const follow = useCallback(
    (command: ClockCommand) => {
      const { session } = latest.current;
      if (command.type === "seek") {
        void playAt({
          position: command.at,
          isPlaying: true,
          speed: command.speed,
        });
      } else if (command.type === "pause") {
        if (session) void pause();
      } else if (command.type === "resume") {
        if (session && session.state !== "ended") void resume();
        else void playAt({ ...command, isPlaying: true });
      } else if (command.type === "speed") {
        if (session) void changeSpeed(command.speed);
      } else {
        void stop();
      }
    },
    [playAt, pause, resume, changeSpeed, stop],
  );
  const wasFullscreen = useRef(false);
  const { read, subscribe } = clock;
  const { adopt, subscribe: subscribeLocal } = local;
  useEffect(() => {
    if (isFullscreen && !wasFullscreen.current) adopt(read());
    else if (!isFullscreen) void playAt(read());
    wasFullscreen.current = isFullscreen;
    return (isFullscreen ? subscribeLocal : subscribe)(follow);
  }, [isFullscreen, adopt, read, subscribe, subscribeLocal, playAt, follow]);
  const active = isFullscreen ? local : clock;
  const isOnline = tile.state !== "server-offline";
  return (
    <div
      ref={root}
      role="group"
      aria-label={tile.name}
      onDoubleClick={(event) => {
        if (!(event.target as Element).closest("button, [role=slider]"))
          toggle();
      }}
      className={cn(
        "group/tile relative flex aspect-video w-full [&:fullscreen]:aspect-auto overflow-hidden border-r border-b bg-sidebar text-xs text-muted-foreground",
        className,
      )}
    >
      <div className="relative flex min-w-0 flex-1 items-center justify-center">
        <PlaybackScreen
          tile={tile}
          session={playback.session}
          error={playback.error}
          hasPosition={active.position !== null}
        />
        <Badge
          variant="overlay"
          className="absolute top-2 left-2 max-w-[calc(100%-6rem)] bg-background/70 text-sm backdrop-blur-md"
        >
          <span className="truncate">{tile.name}</span>
        </Badge>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <SpeakerToggle audioId={`${tile.id}:playback`} />
        </div>
        {isFullscreen && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t bg-background/90 p-2 backdrop-blur-md">
            <PlaybackControls
              clock={local}
              ranges={ranges}
              isDisabled={!isOnline || playback.isBusy}
            />
            <PlaybackTimeline
              key={dayStart}
              ranges={ranges}
              dayStart={dayStart}
              dayEnd={dayEnd}
              position={local.position}
              onSeek={(time) => {
                const at = snapToRange(ranges, time);
                if (isOnline && at !== null) local.seek(at);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

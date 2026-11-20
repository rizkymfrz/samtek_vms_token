"use client";
import {
  BoxIcon,
  CctvIcon,
  ClockIcon,
  FastForwardIcon,
  HashIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  ScanSearchIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect } from "react";
import { DetailField, DetailIdBox } from "@/components/shared/detail-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { usePlaybackSession } from "@/features/camera-detail/hooks/use-playback-session";
import { stepSpeed } from "@/features/camera-detail/lib/recording-timeline";
import {
  PlaybackBoxLayer,
  type RecordingStream,
  usePlaybackBoxes,
} from "@/features/edge-status";
import { WebrtcPlayer } from "@/features/live";
import {
  formatConfidence,
  formatSeenAt,
  formatSimilarity,
} from "../lib/format-score";
import type { SearchData, SearchRow } from "../types";

const PRE_ROLL_MS = 5000;

export type SearchTarget = {
  row: SearchRow;
  camera: string;
  stream: RecordingStream;
  analyticId: string | null;
};

const SearchPlayer = ({
  target,
  relay,
}: {
  target: SearchTarget;
  relay: SearchData["relays"][string];
}) => {
  const { row, stream } = target;
  const playback = usePlaybackSession(row.edgeId, row.deviceId, stream);
  const { seek } = playback;
  useEffect(() => {
    void seek(new Date(row.seenAt - PRE_ROLL_MS));
  }, [seek, row.seenAt]);
  const { session } = playback;
  const boxes = usePlaybackBoxes(session?.sessionId ?? null);
  const isPlaying = session?.state === "playing";
  const isPaused = session?.state === "paused";
  const canControl = !!session && !playback.isBusy;
  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border bg-sidebar text-xs text-muted-foreground">
        {playback.error ? (
          <span role="alert" className="px-4 text-center">
            {playback.error}
          </span>
        ) : session?.state === "ended" ? (
          <span>End of recording</span>
        ) : session ? (
          <>
            <WebrtcPlayer
              relay={relay}
              app={session.app}
              stream={session.stream}
              isSeamless
              isQuiet
              isPaused={isPaused}
              isTimed={boxes.isTimed}
              onFrameTime={boxes.onFrameTime}
            />
            <PlaybackBoxLayer
              objects={boxes.objects}
              reason={boxes.reason}
              analyticId={target.analyticId ?? undefined}
            />
          </>
        ) : (
          <span>Loading recording…</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          aria-label={isPlaying ? "Pause" : "Play"}
          disabled={!canControl || !(isPlaying || isPaused)}
          onClick={() =>
            void (isPlaying ? playback.pause() : playback.resume())
          }
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Rewind"
          disabled={!canControl}
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
          disabled={!canControl}
          onClick={() =>
            void playback.changeSpeed(stepSpeed(session?.speed ?? 1, 1))
          }
        >
          <FastForwardIcon />
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          Starts {PRE_ROLL_MS / 1000}s before the match
        </span>
      </div>
    </div>
  );
};

export const SearchDialog = ({
  target,
  relays,
  onClose,
}: {
  target: SearchTarget | null;
  relays: SearchData["relays"];
  onClose: () => void;
}) => (
  <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
    <DialogContent size="xl">
      {target && (
        <>
          <DialogHeader icon={SearchIcon}>
            <DialogTitle>{target.camera}</DialogTitle>
            <DialogDescription>
              {formatSeenAt(target.row.seenAt)}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <DialogBody>
            <DialogSection className="md:flex-[1.35]">
              <SearchPlayer
                key={target.row.id}
                target={target}
                relay={
                  relays[target.row.edgeId] ?? {
                    webrtcUrl: null,
                    webrtcUrlLocal: null,
                  }
                }
              />
            </DialogSection>
            <DialogDivider />
            <DialogSection>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <DetailField
                  icon={CctvIcon}
                  label="Camera"
                  value={target.camera}
                />
                <DetailField
                  icon={ClockIcon}
                  label="Seen at"
                  value={formatSeenAt(target.row.seenAt)}
                />
                <DetailField
                  icon={BoxIcon}
                  label="Label"
                  value={target.row.label}
                />
                <DetailField
                  icon={ScanSearchIcon}
                  label="Similarity"
                  value={formatSimilarity(target.row.similarity)}
                />
                {target.row.confidence !== null && (
                  <DetailField
                    icon={HashIcon}
                    label="Match confidence"
                    value={formatConfidence(target.row.confidence)}
                  />
                )}
              </div>
              <DetailIdBox
                label="Track key"
                value={target.row.trackKey}
                copyLabel="Copy track key"
              />
            </DialogSection>
          </DialogBody>
        </>
      )}
    </DialogContent>
  </Dialog>
);

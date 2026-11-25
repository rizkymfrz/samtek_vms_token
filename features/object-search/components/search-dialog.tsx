"use client";
import {
  BoxIcon,
  CctvIcon,
  ClockIcon,
  DownloadIcon,
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  ScanSearchIcon,
  SearchIcon,
} from "lucide-react";
import { useEffect } from "react";
import {
  DetailField,
  DetailIdBox,
  DetailLabel,
} from "@/components/shared/detail-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress, ProgressValue } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlaybackSession } from "@/features/camera-detail/hooks/use-playback-session";
import { stepSpeed } from "@/features/camera-detail/lib/recording-timeline";
import {
  PlaybackBoxLayer,
  type RecordingStream,
  usePlaybackBoxes,
} from "@/features/edge-status";
import { WebrtcPlayer } from "@/features/live";
import { SearchCrop } from "./search-crop";
import { formatSeenAt, formatSimilarity } from "../lib/format-score";
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
          <span>End of recording.</span>
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
          aria-label="Slower"
          disabled={!canControl}
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
            <div className="flex items-center gap-2">
              <DialogTitle>{target.camera}</DialogTitle>
              <Badge variant="outline">{target.row.label}</Badge>
            </div>
            <DialogDescription>
              {formatSeenAt(target.row.seenAt)}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <DialogBody>
            <DialogSection className="md:flex-[1.35]">
              <Tabs key={target.row.id} defaultValue="image">
                <TabsList variant="line" size="sm">
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="recording">Recording</TabsTrigger>
                </TabsList>
                <TabsContent value="image">
                  <SearchCrop
                    edgeId={target.row.edgeId}
                    resultId={target.row.resultId}
                    hasCrop={target.row.hasCrop}
                    className="mx-auto h-96"
                  />
                </TabsContent>
                <TabsContent value="recording">
                  <SearchPlayer
                    target={target}
                    relay={
                      relays[target.row.edgeId] ?? {
                        webrtcUrl: null,
                        webrtcUrlLocal: null,
                      }
                    }
                  />
                </TabsContent>
              </Tabs>
            </DialogSection>
            <DialogDivider />
            <DialogSection>
              <div className="flex flex-col gap-2">
                <DetailLabel>Summary</DetailLabel>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <DetailField
                    icon={CctvIcon}
                    label="Camera"
                    value={target.camera}
                  />
                  <DetailField
                    icon={ClockIcon}
                    label="Time"
                    value={formatSeenAt(target.row.seenAt)}
                  />
                  <DetailField
                    icon={BoxIcon}
                    label="Object"
                    value={target.row.label}
                  />
                  <DetailField
                    icon={ScanSearchIcon}
                    label="Similarity"
                    value={formatSimilarity(target.row.similarity)}
                  />
                </div>
              </div>
              {target.row.confidence !== null && (
                <div className="flex flex-col gap-2">
                  <DetailLabel>Match</DetailLabel>
                  <Progress
                    value={Math.round(target.row.confidence * 100)}
                    variant="segmented"
                    aria-label="Match"
                    className="flex-nowrap items-center gap-4"
                  >
                    <ProgressValue className="ml-0 text-lg text-foreground">
                      {(_, value) => `${value}%`}
                    </ProgressValue>
                  </Progress>
                </div>
              )}
              <DetailIdBox
                label="Track key"
                value={target.row.trackKey}
                copyLabel="Copy track key"
              />
            </DialogSection>
          </DialogBody>
          <Separator />
          <DialogFooter>
            <Button
              disabled={!target.row.hasCrop}
              nativeButton={false}
              render={
                <a
                  href={
                    target.row.hasCrop
                      ? `/api/edge/${target.row.edgeId}/search/${target.row.resultId}/crop`
                      : undefined
                  }
                  download={`${target.row.resultId}.jpg`}
                />
              }
            >
              <DownloadIcon />
              Download image
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  </Dialog>
);

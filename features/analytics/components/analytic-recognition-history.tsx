"use client";
import { ScanFaceIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Thumbnail } from "@/components/shared/thumbnail";
import { Badge } from "@/components/ui/badge";
import {
  CaptureFaceDialog,
  type EnrolledPerson,
  type FaceCapture,
} from "@/features/faces";
import {
  formatDateTime,
  matchPercent,
  RecognitionDialog,
  type RecognitionsData,
  useRecognitionLog,
} from "@/features/recognitions";
import { HistoryPanel } from "./analytic-history-panel";

const UNKNOWN = "Unknown";

export const AnalyticRecognitionHistory = ({
  recognizer,
  initialRecognitions,
  isLive,
}: {
  recognizer: string;
  initialRecognitions: RecognitionsData;
  isLive: boolean;
}) => {
  const [range, setRange] = useState<DateRange>();
  const [openId, setOpenId] = useState<string | null>(null);
  const [capture, setCapture] = useState<
    (FaceCapture & { rowId: string }) | null
  >(null);
  const [linked, setLinked] = useState<
    Record<string, EnrolledPerson & { edgeId: string }>
  >({});
  const { data: recognitions } = useRecognitionLog(
    recognizer,
    initialRecognitions,
    isLive,
    range,
  );
  const entries = (recognitions ?? initialRecognitions).rows.map((row) => {
    const person = linked[row.id];
    return person
      ? {
          ...row,
          personId: person.personId,
          name: person.name,
          group: person.group,
          referenceUrl: `/api/edge/${person.edgeId}/faces/${person.faceId}/photo`,
        }
      : row;
  });
  const openRecognition = entries.find((row) => row.id === openId) ?? null;
  return (
    <>
      <HistoryPanel
        title="Recognition history"
        emptyIcon={ScanFaceIcon}
        emptyTitle="No recognitions"
        emptyDescription="Nobody has been recognized yet."
        items={entries}
        range={range}
        onRangeChange={setRange}
        onSelect={setOpenId}
        renderItem={(entry) => (
          <div className="flex items-center gap-2">
            <Thumbnail
              src={entry.cropUrl}
              label={`Detected face of ${entry.name}`}
              icon={ScanFaceIcon}
              className="h-20 w-16"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">
                  {entry.name}
                </span>
                {entry.similarity !== null && (
                  <span className="shrink-0 tabular-nums">
                    {matchPercent(entry.similarity)}%
                  </span>
                )}
              </span>
              <span>
                <Badge
                  variant={entry.group === UNKNOWN ? "destructive" : "default"}
                >
                  {entry.group}
                </Badge>
              </span>
              <span className="truncate text-muted-foreground">
                {entry.camera}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {formatDateTime(new Date(entry.at))}
              </span>
            </div>
            <Thumbnail
              src={entry.referenceUrl}
              label={`Registered photo of ${entry.name}`}
              icon={UserIcon}
              className="h-20 w-16"
              imageClassName="object-top"
            />
          </div>
        )}
      />
      <RecognitionDialog
        recognition={openRecognition}
        onClose={() => setOpenId(null)}
        onAddFace={(row) => {
          if (!row.cropUrl) return;
          setOpenId(null);
          setCapture({ rowId: row.id, edgeId: row.edgeId, url: row.cropUrl });
        }}
      />
      <CaptureFaceDialog
        capture={capture}
        isLive={isLive}
        onSaved={(person) => {
          if (!capture) return;
          setLinked((previous) => ({
            ...previous,
            [capture.rowId]: { ...person, edgeId: capture.edgeId },
          }));
        }}
        onClose={() => setCapture(null)}
      />
    </>
  );
};

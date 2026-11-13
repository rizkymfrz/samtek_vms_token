"use client";
import { ScanFaceIcon, UserIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Thumbnail } from "@/components/shared/thumbnail";
import { Badge } from "@/components/ui/badge";
import {
  AlertDetailDialog,
  type AlertsData,
  useAlerts,
} from "@/features/alerts";
import {
  formatDateTime,
  matchPercent,
  RecognitionDialog,
  type RecognitionsData,
  useRecognitionLog,
} from "@/features/recognitions";
import { HistoryPanel } from "./analytic-history-panel";
import { rangeFilters } from "../lib/range-filters";

const UNKNOWN = "Unknown";
const UNKNOWN_KIND = "face_stranger";

type Entry = {
  id: string;
  at: number;
  name: string;
  group: string;
  similarity: number | null;
  camera: string;
  imageUrl: string | null;
  referenceUrl: string | null;
  isAlert: boolean;
};

export const AnalyticRecognitionHistory = ({
  recognizer,
  initialRecognitions,
  initialAlerts,
  isLive,
}: {
  recognizer: string;
  initialRecognitions: RecognitionsData;
  initialAlerts: AlertsData;
  isLive: boolean;
}) => {
  const [range, setRange] = useState<DateRange>();
  const [openId, setOpenId] = useState<string | null>(null);
  const filters = useMemo(() => rangeFilters(range), [range]);
  const { data: recognitions } = useRecognitionLog(
    recognizer,
    initialRecognitions,
    isLive,
    range,
  );
  const { data: alertsData } = useAlerts(initialAlerts, isLive, filters);
  const alerts = alertsData ?? initialAlerts;
  const entries = useMemo(
    (): Entry[] =>
      [
        ...(recognitions ?? initialRecognitions).rows.map((row): Entry => ({
          id: row.id,
          at: row.at,
          name: row.name,
          group: row.group,
          similarity: row.similarity,
          camera: row.camera,
          imageUrl: row.cropUrl,
          referenceUrl: row.referenceUrl,
          isAlert: false,
        })),
        ...alerts.rows
          .filter(
            (row) => row.analyticId === recognizer && row.kind === UNKNOWN_KIND,
          )
          .map((row): Entry => ({
            id: row.id,
            at: row.at,
            name: UNKNOWN,
            group: UNKNOWN,
            similarity: null,
            camera: row.camera,
            imageUrl: row.imageUrl,
            referenceUrl: null,
            isAlert: true,
          })),
      ].sort((a, b) => b.at - a.at || b.id.localeCompare(a.id)),
    [recognitions, initialRecognitions, alerts.rows, recognizer],
  );
  const openAlert = alerts.rows.find((row) => row.id === openId) ?? null;
  const openRecognition =
    (recognitions ?? initialRecognitions).rows.find(
      (row) => row.id === openId,
    ) ?? null;
  return (
    <>
      <HistoryPanel
        title="Recognition History"
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
              src={entry.imageUrl}
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
            {!entry.isAlert && (
              <Thumbnail
                src={entry.referenceUrl}
                label={`Registered photo of ${entry.name}`}
                icon={UserIcon}
                className="h-20 w-16"
                imageClassName="object-top"
              />
            )}
          </div>
        )}
      />
      <AlertDetailDialog alert={openAlert} onClose={() => setOpenId(null)} />
      <RecognitionDialog
        recognition={openRecognition}
        onClose={() => setOpenId(null)}
      />
    </>
  );
};

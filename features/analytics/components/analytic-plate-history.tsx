"use client";
import { CarFrontIcon, ScanLineIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Thumbnail } from "@/components/shared/thumbnail";
import { Badge } from "@/components/ui/badge";
import {
  formatDateTime,
  PlateDialog,
  type RecognitionsData,
  useRecognitionLog,
} from "@/features/recognitions";
import { HistoryPanel } from "./analytic-history-panel";

export const AnalyticPlateHistory = ({
  recognizer,
  initialRecognitions,
}: {
  recognizer: string;
  initialRecognitions: RecognitionsData;
}) => {
  const [range, setRange] = useState<DateRange>();
  const [openId, setOpenId] = useState<string | null>(null);
  const { data } = useRecognitionLog(recognizer, initialRecognitions, range);
  const rows = useMemo(
    () => (data ?? initialRecognitions).rows,
    [data, initialRecognitions],
  );
  const open = rows.find((row) => row.id === openId) ?? null;
  return (
    <>
      <HistoryPanel
        title="Plate history"
        emptyIcon={ScanLineIcon}
        emptyTitle="No plates"
        emptyDescription="No license plate has been read yet."
        items={rows}
        range={range}
        onRangeChange={setRange}
        onSelect={setOpenId}
        renderItem={(row) => (
          <div className="flex items-center gap-2">
            <Thumbnail
              src={row.cropUrl}
              label={`Detected vehicle ${row.plate ?? ""}`}
              icon={CarFrontIcon}
              className="h-20 w-28"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-sm font-medium tabular-nums">
                {row.plate ?? "Unreadable"}
              </span>
              {(row.vehicleType ?? row.vehicleColor) && (
                <span>
                  <Badge>
                    {[row.vehicleColor, row.vehicleType]
                      .filter(Boolean)
                      .join(" ")}
                  </Badge>
                </span>
              )}
              <span className="truncate text-muted-foreground">
                {row.camera}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {formatDateTime(new Date(row.at))}
              </span>
            </div>
          </div>
        )}
      />
      <PlateDialog recognition={open} onClose={() => setOpenId(null)} />
    </>
  );
};

"use client";
import {
  ActivityIcon,
  CalendarIcon,
  CctvIcon,
  CircleCheckIcon,
  ClockIcon,
  HistoryIcon,
  ServerIcon,
  Volume2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { Pick } from "@/components/shared/pick";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alarmKindLabel } from "@/config/display-labels";
import { useDeviceList } from "@/features/cameras";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { formatDateTime } from "@/lib/format-date";
import { useSpeakerCalls } from "../hooks/use-speaker-calls";
import {
  CALL_STATUS,
  durationText,
  reasonText,
  SOURCE_LABEL,
  statusOf,
} from "../lib/calls";
import type { ServerOption, SpeakerRecord } from "../types";

const ALL = "all";
const PAGE_SIZE = 20;

export const CallsPanel = ({
  servers,
  speakers,
}: {
  servers: ServerOption[];
  speakers: SpeakerRecord[];
}) => {
  const { data, isPending, isError } = useSpeakerCalls();
  const { data: devices } = useDeviceList();
  const [server, setServer] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(0);
  useFailureToast(
    "Some data did not load",
    (data?.failures ?? []).map((item) => `${item.edgeName}: ${item.message}`),
  );
  const cameraName = useMemo(
    () =>
      new Map(
        (devices?.cameras ?? []).map((camera) => [
          `${camera.edgeServerId}-${camera.id}`,
          camera.name,
        ]),
      ),
    [devices],
  );
  const speakerName = useMemo(
    () =>
      new Map(
        speakers.map((speaker) => [
          `${speaker.edgeServerId}-${speaker.id}`,
          speaker.name,
        ]),
      ),
    [speakers],
  );
  const matches = useMemo(
    () =>
      (data?.calls ?? []).filter(
        (call) =>
          (server === ALL || call.edgeId === server) &&
          (status === ALL || call.status === status),
      ),
    [data, server, status],
  );
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = matches.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const serverItems = [
    { value: ALL, label: "All edge servers" },
    ...servers.map((item) => ({ value: item.id, label: item.name })),
  ];
  const statusItems = [
    { value: ALL, label: "All statuses" },
    ...Object.entries(CALL_STATUS).map(([value, { label }]) => ({
      value,
      label,
    })),
  ];
  return (
    <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
      <ListToolbar
        noun="plays"
        page={safePage}
        pageSize={PAGE_SIZE}
        total={matches.length}
        onPageChange={setPage}
      >
        <Pick
          label="Edge server"
          icon={ServerIcon}
          items={serverItems}
          value={server}
          onChange={(next) => {
            setServer(next);
            setPage(0);
          }}
          className="w-56"
        />
        <Pick
          label="Status"
          icon={ActivityIcon}
          items={statusItems}
          value={status}
          onChange={(next) => {
            setStatus(next);
            setPage(0);
          }}
          className="w-48"
        />
      </ListToolbar>
      {matches.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon />}
          title={
            isPending
              ? "Loading play history…"
              : isError
                ? "Failed to load the play history"
                : (data?.calls.length ?? 0) === 0
                  ? "No plays yet"
                  : "No plays found"
          }
          description={
            isPending || isError
              ? undefined
              : (data?.calls.length ?? 0) === 0
                ? "Plays appear here after a camera rule or a test."
                : "No plays match the filters."
          }
        />
      ) : (
        <div className="flex flex-col overflow-hidden rounded border lg:min-h-0 lg:flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead icon={CalendarIcon}>Time</TableHead>
                <TableHead icon={ServerIcon}>Edge server</TableHead>
                <TableHead icon={CctvIcon}>Camera</TableHead>
                <TableHead icon={Volume2Icon}>Speaker</TableHead>
                <TableHead icon={ActivityIcon}>Trigger</TableHead>
                <TableHead icon={CircleCheckIcon}>Result</TableHead>
                <TableHead icon={ClockIcon}>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((call) => {
                const result = statusOf(call.status);
                return (
                  <TableRow key={`${call.edgeId}-${call.id}`}>
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {formatDateTime(call.occurredAt)}
                    </TableCell>
                    <TableCell>{call.edgeName}</TableCell>
                    <TableCell>
                      {call.deviceId
                        ? (cameraName.get(`${call.edgeId}-${call.deviceId}`) ??
                          `ID ${call.deviceId}`)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {call.speakerId
                        ? (speakerName.get(
                            `${call.edgeId}-${call.speakerId}`,
                          ) ?? `ID ${call.speakerId}`)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {call.kind
                            ? alarmKindLabel(call.kind)
                            : (SOURCE_LABEL[call.source] ?? call.source)}
                        </span>
                        {call.label && (
                          <span className="text-muted-foreground">
                            {call.label}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant={result.variant}>{result.label}</Badge>
                        {call.reason && (
                          <span className="text-muted-foreground">
                            {reasonText(call.reason)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {durationText(call.durationMs)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

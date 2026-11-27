import {
  ActivityIcon,
  CalendarIcon,
  CircleCheckIcon,
  EllipsisIcon,
  NetworkIcon,
  PlayIcon,
  ServerIcon,
  Trash2Icon,
  Volume2Icon,
} from "lucide-react";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import { applyState } from "../lib/apply-state";
import type { ServerOption, SpeakerRecord } from "../types";

const APPLY_LABEL = {
  applied: "Applied",
  rejected: "Rejected",
  pending: "Pending",
} as const;

const APPLY_DOT = {
  applied: "live",
  rejected: "danger",
  pending: "caution",
} as const;

export const SpeakerTable = ({
  speakers,
  servers,
  testingId,
  onSelect,
  onTest,
  onDelete,
}: {
  speakers: SpeakerRecord[];
  servers: ServerOption[];
  testingId: string | null;
  onSelect: (speaker: SpeakerRecord) => void;
  onTest: (speaker: SpeakerRecord) => void;
  onDelete: (speaker: SpeakerRecord) => void;
}) => {
  const serverName = new Map(servers.map((server) => [server.id, server.name]));
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead icon={Volume2Icon}>Speaker</TableHead>
          <TableHead icon={ServerIcon}>Edge server</TableHead>
          <TableHead icon={NetworkIcon}>Address</TableHead>
          <TableHead icon={Volume2Icon}>Volume</TableHead>
          <TableHead icon={ActivityIcon}>Status</TableHead>
          <TableHead icon={CircleCheckIcon}>Configuration</TableHead>
          <TableHead icon={CalendarIcon}>Created</TableHead>
          <TableHead icon={EllipsisIcon} className="text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {speakers.map((speaker) => {
          const state = applyState(speaker);
          return (
            <TableRow
              key={`${speaker.edgeServerId}-${speaker.id}`}
              tabIndex={0}
              onClick={() => onSelect(speaker)}
              onKeyDown={(event) =>
                event.target === event.currentTarget &&
                event.key === "Enter" &&
                onSelect(speaker)
              }
              className="cursor-pointer outline-none focus-visible:bg-muted"
            >
              <TableCell>
                <span className="font-medium">{speaker.name}</span>
              </TableCell>
              <TableCell>
                {serverName.get(speaker.edgeServerId) ?? "Unknown"}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {speaker.host}:{speaker.port}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {speaker.volume}%
              </TableCell>
              <TableCell>
                <Badge variant={speaker.isEnabled ? "default" : "secondary"}>
                  {speaker.isEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </TableCell>
              <TableCell>
                <span
                  title={speaker.applyError?.message}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <StatusDot status={APPLY_DOT[state]} />
                  {APPLY_LABEL[state]}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDate(speaker.createdAt)}
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label={`Test ${speaker.name}`}
                    title={`Test ${speaker.name}`}
                    disabled={testingId !== null}
                    onClick={() => onTest(speaker)}
                  >
                    <PlayIcon />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label={`Delete ${speaker.name}`}
                    title={`Delete ${speaker.name}`}
                    onClick={() => onDelete(speaker)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

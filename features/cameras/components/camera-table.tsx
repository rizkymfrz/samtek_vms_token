import {
  ActivityIcon,
  CctvIcon,
  CircleCheckIcon,
  CircleDotIcon,
  EllipsisIcon,
  PowerIcon,
  RadioIcon,
  ScanSearchIcon,
  ServerIcon,
  Trash2Icon,
} from "lucide-react";
import { Pick } from "@/components/shared/pick";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { analyticLabel } from "@/config/analytics-catalog";
import { cn } from "@/lib/utils";
import {
  APPLY_LABEL,
  applyState,
  cameraState,
  STATE_LABEL,
} from "../lib/camera-state";
import type { CameraRecord, ServerOption } from "../types";

const APPLY_DOT = {
  applied: "live",
  rejected: "danger",
  pending: "caution",
} as const;

export const CameraTable = ({
  cameras,
  servers,
  onSelect,
  onToggle,
  onDelete,
}: {
  cameras: CameraRecord[];
  servers: ServerOption[];
  onSelect: (id: string) => void;
  onDelete: (camera: CameraRecord) => void;
  onToggle: (
    id: string,
    patch: Partial<Pick<CameraRecord, "isEnabled" | "isRecordingEnabled">>,
  ) => void;
}) => {
  const serverName = new Map(servers.map((s) => [s.id, s.name]));
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead icon={CctvIcon}>Camera</TableHead>
          <TableHead icon={ServerIcon}>Edge server</TableHead>
          <TableHead icon={ScanSearchIcon}>Analytic</TableHead>
          <TableHead icon={ActivityIcon}>Status</TableHead>
          <TableHead icon={CircleCheckIcon}>Configuration</TableHead>
          <TableHead icon={RadioIcon}>Streams</TableHead>
          <TableHead icon={PowerIcon}>Enabled</TableHead>
          <TableHead icon={CircleDotIcon}>Recording</TableHead>
          <TableHead icon={EllipsisIcon} className="text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cameras.map((camera) => {
          const state = cameraState(camera, servers);
          return (
            <TableRow
              key={camera.id}
              tabIndex={0}
              onClick={() => onSelect(camera.id)}
              onKeyDown={(event) =>
                event.target === event.currentTarget &&
                event.key === "Enter" &&
                onSelect(camera.id)
              }
              className="cursor-pointer outline-none focus-visible:bg-muted"
            >
              <TableCell>
                <span className="font-medium">{camera.name}</span>
              </TableCell>
              <TableCell>
                {serverName.get(camera.edgeServerId) ?? "Unknown"}
              </TableCell>
              <TableCell
                className={cn(!camera.analyticId && "text-muted-foreground")}
              >
                {camera.analyticId ? analyticLabel(camera.analyticId) : "None"}
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <StatusDot status={state === "live" ? "live" : "offline"} />
                  {STATE_LABEL[state]}
                </span>
              </TableCell>
              <TableCell>
                <span
                  title={camera.applyError?.message}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <StatusDot status={APPLY_DOT[applyState(camera)]} />
                  {APPLY_LABEL[applyState(camera)]}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {[
                  "Main",
                  camera.sourceSub && "Sub",
                  camera.sourceThird && "Third",
                ]
                  .filter(Boolean)
                  .join(" + ")}
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Switch
                  size="sm"
                  checked={camera.isEnabled}
                  aria-label={`${camera.name} enabled`}
                  onCheckedChange={(isEnabled) =>
                    onToggle(camera.id, { isEnabled })
                  }
                />
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Switch
                  size="sm"
                  checked={camera.isRecordingEnabled}
                  aria-label={`${camera.name} recording`}
                  onCheckedChange={(isRecordingEnabled) =>
                    onToggle(camera.id, { isRecordingEnabled })
                  }
                />
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label={`Delete ${camera.name}`}
                    title={`Delete ${camera.name}`}
                    onClick={() => onDelete(camera)}
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

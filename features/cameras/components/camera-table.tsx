import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Pick } from "@/components/shared/pick";
import { StatusDot } from "@/components/shared/status-dot";
import { analyticLabel } from "@/config/analytics-catalog";
import type { CameraRecord, ServerOption } from "../types";
import { cameraState, STATE_LABEL } from "../lib/camera-state";

export const CameraTable = ({
  cameras,
  servers,
  onSelect,
  onToggle,
}: {
  cameras: CameraRecord[];
  servers: ServerOption[];
  onSelect: (id: string) => void;
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
          <TableHead>Camera</TableHead>
          <TableHead>Edge server</TableHead>
          <TableHead>Analytic</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Streams</TableHead>
          <TableHead>Enabled</TableHead>
          <TableHead>Recording</TableHead>
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
                <div className="flex flex-col">
                  <span className="font-medium">{camera.name}</span>
                  <span className="text-muted-foreground">
                    {camera.deviceId}
                  </span>
                </div>
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
              <TableCell className="text-muted-foreground">
                {camera.sourceSub ? "Main + Sub" : "Main"}
              </TableCell>
              {/* The switches act on their own: a click must not also open the editor. */}
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

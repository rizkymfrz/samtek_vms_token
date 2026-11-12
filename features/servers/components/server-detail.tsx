"use client";
import {
  PencilIcon,
  PowerIcon,
  RotateCwIcon,
  TerminalIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mqttConfig } from "@/config/mqtt";
import { cn } from "@/lib/utils";
import { MetricChart } from "./metric-chart";
import { Stats } from "./stats";
import { StorageCard } from "./storage-card";
import { percentLevel, TEMP_LIMIT, tempLevel } from "../lib/metric-level";
import type { Metrics, ServerRecord } from "../types";

const last = (points: number[]) => points[points.length - 1];

export const ServerDetail = ({
  server,
  isLive,
  online,
  restarting,
  isRestartingEdge,
  metrics,
  onLogs,
  onEdit,
  onRestart,
  onRestartEdge,
  onDelete,
}: {
  server: ServerRecord;
  isLive: boolean;
  online: boolean;
  restarting: boolean;
  isRestartingEdge: boolean;
  metrics: Metrics | null;
  onLogs: () => void;
  onEdit: () => void;
  onRestart: () => void;
  onRestartEdge: () => void;
  onDelete: () => void;
}) => {
  const [confirm, setConfirm] = useState<"restart" | "edge" | null>(null);
  const empty = !online
    ? "No data. The server is offline."
    : !metrics
      ? isLive && !mqttConfig
        ? "Metrics are not available from the API yet."
        : "Waiting for the first report."
      : undefined;
  const temp = metrics ? (last(metrics.cpuTemp) ?? 0) : 0;
  const memory = metrics ? (last(metrics.memory) ?? 0) : 0;
  const cpu = metrics ? (last(metrics.cpu) ?? 0) : 0;
  const memoryUsed = metrics ? (memory / 100) * metrics.memoryTotalGb : 0;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h2 className="text-base font-medium">{server.name}</h2>
            {server.description && (
              <p className="text-xs text-muted-foreground">
                {server.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {server.vendor && <Badge variant="outline">{server.vendor}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isLive && (
            <Button variant="secondary" onClick={onLogs}>
              <TerminalIcon />
              Log Stream
            </Button>
          )}
          <Button variant="default" onClick={onEdit}>
            <PencilIcon />
            Edit Server
          </Button>
          {mqttConfig && (
            <Button
              variant="secondary"
              disabled={!online || isRestartingEdge}
              onClick={() => setConfirm("edge")}
            >
              <PowerIcon />
              Restart Edge
            </Button>
          )}
          {!isLive && (
            <Button
              variant="secondary"
              disabled={restarting}
              onClick={() => setConfirm("restart")}
            >
              <RotateCwIcon className={cn(restarting && "animate-spin")} />
              Restart Server
            </Button>
          )}
          <Button variant="destructive" onClick={onDelete}>
            <Trash2Icon />
            Delete Server
          </Button>
        </div>
      </div>
      <div className="grid gap-4 lg:flex-1 lg:grid-cols-2 lg:auto-rows-fr">
        <MetricChart
          title="CPU Temperature"
          value={`${temp} °C`}
          level={tempLevel(temp)}
          points={metrics?.cpuTemp ?? []}
          domain={[40, 90]}
          ticks={[40, 65, 90]}
          unit="°C"
          limit={TEMP_LIMIT}
          empty={empty}
        />
        <MetricChart
          title="Memory Usage"
          value={`${Math.round(memory)}%`}
          level={percentLevel(memory)}
          points={metrics?.memory ?? []}
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          unit="%"
          empty={empty}
          footer={
            metrics && (
              <Stats
                items={[
                  ["Used", `${memoryUsed.toFixed(1)} GB`],
                  [
                    "Available",
                    `${(metrics.memoryTotalGb - memoryUsed).toFixed(1)} GB`,
                  ],
                  ["Total", `${metrics.memoryTotalGb} GB`],
                ]}
              />
            )
          }
        />
        <MetricChart
          title="CPU Usage"
          value={`${Math.round(cpu)}%`}
          level={percentLevel(cpu)}
          points={metrics?.cpu ?? []}
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          unit="%"
          empty={empty}
          footer={null}
        />
        <StorageCard
          storage={
            metrics?.storage ?? {
              recordings: 0,
              analytics: 0,
              system: 0,
              free: 0,
              retentionDays: null,
            }
          }
          empty={empty}
        />
      </div>
      <AlertDialog
        open={confirm === "restart"}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart {server.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Its {server.cameraCount} cameras stop streaming and analyzing
              until the server is back, which takes about a minute.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirm(null);
                onRestart();
              }}
            >
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={confirm === "edge"}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restart the edge of {server.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The edge process stops and is started again by its service
              manager. Cameras stop streaming and analyzing until it is back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirm(null);
                onRestartEdge();
              }}
            >
              Restart Edge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

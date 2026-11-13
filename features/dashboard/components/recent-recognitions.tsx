"use client";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { mqttConfig } from "@/config/mqtt";
import { useRecognitions } from "@/features/edge-status";
import { NoData } from "./no-data";
import {
  type RecentFace,
  type RecentPlate,
  toLiveFaces,
  toLivePlates,
} from "../lib/live-recognitions";

const Row = ({ children }: { children: ReactNode }) => {
  return (
    <li className="flex items-center justify-between gap-2 border-b py-2 last:border-b-0">
      {children}
    </li>
  );
};

const RecentFaceList = ({ faces }: { faces: RecentFace[] }) => {
  if (!faces.length) return <NoData />;
  return (
    <ul>
      {faces.map((face) => (
        <Row key={face.id}>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{face.name}</span>
            <span className="truncate text-muted-foreground">
              {face.device} · {face.time}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant={face.group === "Unknown" ? "destructive" : "outline"}
            >
              {face.group}
            </Badge>
            <span className="w-8 text-right text-xs tabular-nums">
              {Math.round(face.similarity * 100)}%
            </span>
          </div>
        </Row>
      ))}
    </ul>
  );
};

const RecentPlateList = ({ plates }: { plates: RecentPlate[] }) => {
  if (!plates.length) return <NoData />;
  return (
    <ul>
      {plates.map((plate) => (
        <Row key={plate.id}>
          <div className="flex min-w-0 flex-col">
            <span className="font-medium tabular-nums">{plate.plate}</span>
            <span className="truncate text-muted-foreground">
              {plate.vehicle} · {plate.device}
            </span>
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {plate.time}
          </span>
        </Row>
      ))}
    </ul>
  );
};

export const RecentFaces = ({
  faces,
  deviceNames,
}: {
  faces: RecentFace[];
  deviceNames: Record<string, string>;
}) => {
  const entries = useRecognitions();
  return (
    <RecentFaceList
      faces={mqttConfig ? toLiveFaces(entries, deviceNames) : faces}
    />
  );
};

export const RecentPlates = ({
  plates,
  deviceNames,
}: {
  plates: RecentPlate[];
  deviceNames: Record<string, string>;
}) => {
  const entries = useRecognitions();
  return (
    <RecentPlateList
      plates={mqttConfig ? toLivePlates(entries, deviceNames) : plates}
    />
  );
};

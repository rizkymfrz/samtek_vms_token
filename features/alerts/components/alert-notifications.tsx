"use client";
import { useState, useSyncExternalStore } from "react";
import {
  type HeaderAlert,
  HeaderNotifications,
} from "@/components/layout/header-notifications";
import { usePersistedStore } from "@/hooks/use-persisted-store";
import { AlertDetailDialog } from "./alert-detail-dialog";
import { AlertImage } from "./alert-image";
import { useNotifications } from "../hooks/use-notifications";
import { notificationStore } from "../lib/notification-store";
import { timeAgo } from "../lib/time-ago";

const LIST_SIZE = 10;
const TICK_MS = 30_000;

const subscribe = (onTick: () => void) => {
  const timer = setInterval(onTick, TICK_MS);
  return () => clearInterval(timer);
};

const getSnapshot = () => Math.floor(Date.now() / TICK_MS);
const getServerSnapshot = () => 0;

export const AlertNotifications = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data } = useNotifications();
  const { status, value } = usePersistedStore(notificationStore);
  const slice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = slice ? slice * TICK_MS : null;
  const rows = data?.rows ?? [];
  const isReady = status === "ready";
  const alerts: HeaderAlert[] = rows.slice(0, LIST_SIZE).map((row) => ({
    id: row.id,
    title: row.title,
    source: row.camera,
    analytic: row.analytic,
    object: row.object,
    perimeter: row.perimeter === "None" ? null : row.perimeter,
    risk: row.risk,
    time: now === null ? "" : timeAgo(row.at, now),
    severity: row.risk === "high" ? "critical" : "info",
    read: !isReady || row.at <= value.readAt,
    image: <AlertImage path={row.imagePath} src={row.imageUrl} />,
  }));
  const unread = isReady
    ? rows.filter((row) => row.at > value.readAt).length
    : 0;
  const selected = rows.find((row) => row.id === selectedId) ?? null;
  return (
    <>
      <HeaderNotifications
        alerts={alerts}
        unread={unread}
        onMarkAllRead={() =>
          notificationStore.update(() => ({ readAt: Date.now() }))
        }
        onSelect={setSelectedId}
      />
      <AlertDetailDialog alert={selected} onClose={() => setSelectedId(null)} />
    </>
  );
};

"use client";
import { useSyncExternalStore } from "react";
import {
  type HeaderAlert,
  HeaderNotifications,
} from "@/components/layout/header-notifications";
import { usePersistedStore } from "@/hooks/use-persisted-store";
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
    time: now === null ? "" : timeAgo(row.at, now),
    severity: row.risk === "high" ? "critical" : "info",
    read: !isReady || row.at <= value.readAt,
  }));
  const unread = isReady
    ? rows.filter((row) => row.at > value.readAt).length
    : 0;
  return (
    <HeaderNotifications
      alerts={alerts}
      unread={unread}
      onMarkAllRead={() =>
        notificationStore.update(() => ({ readAt: Date.now() }))
      }
    />
  );
};

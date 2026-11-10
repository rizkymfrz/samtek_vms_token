import { analyticLabel } from "@/app/(app)/_data/analytics-catalog";
import {
  buildLiveSource,
  HEARTBEAT_SECONDS,
} from "@/app/(app)/_data/live-source";
import type { LiveData, Tile } from "../types";

export const buildLive = (now = Date.now()): LiveData => {
  const { edgeServers, devices, layouts, layoutDevices } = buildLiveSource(now);
  const isOnline = (s: (typeof edgeServers)[number]) =>
    s.isActive &&
    s.lastSeenAt !== null &&
    now - s.lastSeenAt.getTime() < HEARTBEAT_SECONDS * 1000;
  const server = new Map(edgeServers.map((s) => [s.id, s]));
  const tiles: Tile[] = devices.map((d) => {
    const s = server.get(d.edgeServerId)!;
    return {
      id: d.id,
      deviceId: d.deviceId,
      name: d.name,
      serverId: s.id,
      serverName: s.name,
      analytic: d.analyticId ? analyticLabel(d.analyticId) : null,
      isRecordingEnabled: d.isRecordingEnabled,
      state: !d.isEnabled
        ? "disabled"
        : isOnline(s)
          ? "live"
          : "server-offline",
      hasSubStream: d.sourceSub !== null,
    };
  });
  return {
    servers: edgeServers.map((s) => ({
      id: s.id,
      name: s.name,
      online: isOnline(s),
    })),
    tiles,
    layouts: layouts
      .map((layout) => {
        const slots: (string | null)[] = Array.from(
          { length: layout.rows * layout.columns },
          () => null,
        );
        for (const link of layoutDevices.filter(
          (l) => l.layoutId === layout.id,
        )) {
          if (link.position < slots.length)
            slots[link.position] = link.deviceRecordId;
        }
        const { id, name, description, rows, columns, isDefault } = layout;
        return { id, name, description, rows, columns, isDefault, slots };
      })
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
  };
};

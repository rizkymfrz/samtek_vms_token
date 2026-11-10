import { analyticLabel } from "@/config/analytics-catalog";
import { isServerOnline } from "@/config/server-status";
import { buildLiveSource } from "@/lib/mock/live-source";
import { summaryOf } from "../lib/edit-layout";
import type { LiveData, Tile } from "../types";

export const buildLive = (now = Date.now()): LiveData => {
  const { edgeServers, devices, layouts, layoutDevices } = buildLiveSource(now);
  const isOnline = (s: (typeof edgeServers)[number]) =>
    isServerOnline(
      { isActive: s.isActive, lastSeenAt: s.lastSeenAt?.getTime() ?? null },
      now,
    );
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
      webrtcUrl: s.webrtcUrl,
      webrtcUrlLocal: s.webrtcUrlLocal,
    };
  });
  const detailed = layouts
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
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  return {
    servers: edgeServers.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      isActive: s.isActive,
      online: isOnline(s),
    })),
    tiles,
    layouts: detailed.map(summaryOf),
    details: Object.fromEntries(detailed.map((layout) => [layout.id, layout])),
    failures: [],
  };
};

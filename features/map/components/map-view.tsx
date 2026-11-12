"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { toast } from "@/components/ui/toast";
import { useServerOnline } from "@/features/edge-status";
import { CameraPreview } from "@/features/live";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { messageOf } from "@/lib/axios/browser-client";
import { MapCanvas, markerKey } from "./map-canvas";
import { MapPanel } from "./map-panel";
import { MAP_QUERY_KEY, useMap } from "../hooks/use-map";
import { saveLocationRequest } from "../services/map-api";
import type { MapData, MapMarker, MapPlace } from "../types";

export const MapView = ({
  data: initial,
  isLive,
}: {
  data: MapData;
  isLive: boolean;
}) => {
  const queryClient = useQueryClient();
  const { data } = useMap(initial, isLive);
  const [placing, setPlacing] = useState<MapPlace | null>(null);
  const save = useMutation({
    mutationFn: saveLocationRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEY }),
    onError: (error) =>
      toast.add({
        title: "Could not save the location",
        description: messageOf(error),
        type: "error",
      }),
  });
  const saveLocation = (
    target: MapPlace | MapMarker,
    latitude: number | null,
    longitude: number | null,
  ) => {
    const round = (value: number | null) =>
      value === null ? null : Math.round(value * 1e6) / 1e6;
    save.mutate({
      type: target.type,
      id: target.id,
      edgeServerId:
        target.type !== "device"
          ? undefined
          : "edgeServerId" in target
            ? target.edgeServerId
            : (target.parentId ?? undefined),
      latitude: round(latitude),
      longitude: round(longitude),
    });
  };
  useFailureToast(
    "Some map data did not load",
    data.failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const serverOnline = useServerOnline();
  const selected = data.markers.find((m) => markerKey(m) === selectedKey);
  const server =
    selected?.type === "device"
      ? data.servers.find((s) => s.id === selected.edgeServerId)
      : undefined;
  const popup =
    selected?.type === "device" ? (
      <CameraPreview
        camera={{
          id: selected.id,
          name: selected.name,
          serverId: selected.edgeServerId,
          serverName: server?.name ?? "Unknown",
          state: !selected.isEnabled
            ? "disabled"
            : server && serverOnline(server, server.online)
              ? "live"
              : "server-offline",
          hasSubStream: selected.hasSubStream,
          webrtcUrl: server?.webrtcUrl ?? null,
          webrtcUrlLocal: server?.webrtcUrlLocal ?? null,
        }}
        onClose={() => setSelectedKey(null)}
      />
    ) : null;
  const select = (marker: MapMarker) =>
    setSelectedKey((current) =>
      current === markerKey(marker) ? null : markerKey(marker),
    );
  return (
    <PageShell>
      <SidePanel>
        <MapPanel
          markers={data.markers}
          selectedKey={selectedKey}
          query={query}
          onQuery={setQuery}
          onSelect={select}
          truncated={data.truncated}
          unplaced={data.unplaced}
          isLive={isLive}
          isBusy={save.isPending}
          placing={placing}
          onPlacing={setPlacing}
          onRemove={(marker) => saveLocation(marker, null, null)}
        />
      </SidePanel>
      <MapCanvas
        markers={data.markers}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
        isDraggable={isLive}
        isPlacing={placing !== null}
        onPlace={(latitude, longitude) => {
          if (placing) saveLocation(placing, latitude, longitude);
          setPlacing(null);
        }}
        onMove={saveLocation}
        popup={popup}
      />
    </PageShell>
  );
};

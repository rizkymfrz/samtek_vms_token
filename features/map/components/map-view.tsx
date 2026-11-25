"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { toast } from "@/components/ui/toast";
import {
  useBodyworn,
  useDeviceFault,
  useDeviceFaulty,
  useServerOnline,
} from "@/features/edge-status";
import { CameraPreview } from "@/features/live";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { messageOf } from "@/lib/axios/browser-client";
import { deviceStateOf } from "@/lib/device-state";
import { BodywornDetails } from "./bodyworn-details";
import { MapCanvas, markerKey } from "./map-canvas";
import { MapPanel } from "./map-panel";
import {
  devicePositionsKey,
  useDevicePositions,
} from "../hooks/use-device-positions";
import { MAP_QUERY_KEY, useMap } from "../hooks/use-map";
import { useMatchedTrail } from "../hooks/use-matched-trail";
import { appendFix, msUntilNextDay, startOfDay, trailOf } from "../lib/trail";
import { saveLocationRequest } from "../services/map-api";
import type { DevicePosition, MapData, MapMarker, MapPlace } from "../types";

export const MapView = ({
  data: initial,
  isLive,
}: {
  data: MapData;
  isLive: boolean;
}) => {
  const queryClient = useQueryClient();
  const { data: fetched } = useMap(initial, isLive);
  const bodyworn = useBodyworn();
  const data = useMemo(() => {
    const live = (edgeId: string, deviceId: string) =>
      bodyworn(edgeId, deviceId)?.position ?? null;
    const markers = fetched.markers.map((marker) => {
      if (marker.type !== "device") return marker;
      const position = live(marker.edgeServerId, marker.id);
      return position
        ? {
            ...marker,
            latitude: position.latitude,
            longitude: position.longitude,
            inherited: false,
          }
        : marker;
    });
    const unplaced: MapPlace[] = [];
    for (const place of fetched.unplaced) {
      const position =
        place.type === "device" && place.parentId
          ? live(place.parentId, place.id)
          : null;
      if (!position || !place.parentId) {
        unplaced.push(place);
        continue;
      }
      markers.push({
        type: "device",
        id: place.id,
        name: place.name,
        edgeServerId: place.parentId,
        isEnabled: place.isActive,
        hasSubStream: false,
        analytic: place.analytic ?? null,
        inherited: false,
        latitude: position.latitude,
        longitude: position.longitude,
      });
    }
    return { ...fetched, markers, unplaced };
  }, [fetched, bodyworn]);
  const [placing, setPlacing] = useState<MapPlace | null>(null);
  const save = useMutation({
    mutationFn: saveLocationRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAP_QUERY_KEY }),
    onError: (error) =>
      toast.add({
        title: "Failed to save the location",
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
  const isFaulty = useDeviceFaulty();
  const fault = useDeviceFault();
  const online = new Set(
    data.servers.filter((s) => serverOnline(s, s.online)).map((s) => s.id),
  );
  const selected = data.markers.find((m) => markerKey(m) === selectedKey);
  const server =
    selected?.type === "device"
      ? data.servers.find((s) => s.id === selected.edgeServerId)
      : undefined;
  const selectedBodyworn =
    selected?.type === "device"
      ? bodyworn(selected.edgeServerId, selected.id)
      : null;
  const [dayStart, setDayStart] = useState(() => startOfDay(Date.now()));
  useEffect(() => {
    const timer = setTimeout(
      () => setDayStart(startOfDay(Date.now())),
      msUntilNextDay(Date.now()) + 1000,
    );
    return () => clearTimeout(timer);
  }, [dayStart]);
  const trackTarget =
    isLive && selected?.type === "device" && selectedBodyworn
      ? { edgeServerId: selected.edgeServerId, deviceId: selected.id }
      : null;
  const history = useDevicePositions(trackTarget, dayStart);
  useFailureToast("Failed to load the movement trail", [
    history.error && messageOf(history.error),
  ]);
  const livePosition = selectedBodyworn?.position ?? null;
  const liveLatitude = livePosition?.latitude;
  const liveLongitude = livePosition?.longitude;
  const liveFixedAt = livePosition?.fixedAt ?? null;
  const historyLoaded = history.data !== undefined;
  useEffect(() => {
    if (
      !trackTarget ||
      !historyLoaded ||
      liveLatitude === undefined ||
      liveLongitude === undefined
    ) {
      return;
    }
    queryClient.setQueryData<DevicePosition[]>(
      devicePositionsKey(trackTarget, dayStart),
      (old) =>
        old &&
        appendFix(
          old,
          {
            latitude: liveLatitude,
            longitude: liveLongitude,
            fixedAt: liveFixedAt,
          },
          Date.now(),
        ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trackTarget?.edgeServerId,
    trackTarget?.deviceId,
    dayStart,
    historyLoaded,
    liveLatitude,
    liveLongitude,
    liveFixedAt,
    queryClient,
  ]);
  const rawTrail = history.data ? trailOf(history.data, livePosition) : [];
  const trail = useMatchedTrail(
    rawTrail,
    `${trackTarget?.edgeServerId}-${trackTarget?.deviceId}-${dayStart}`,
  );
  const popup =
    selected?.type === "device" ? (
      <CameraPreview
        camera={{
          id: selected.id,
          name: selected.name,
          serverId: selected.edgeServerId,
          serverName: server?.name ?? "Unknown",
          state: deviceStateOf({
            isEnabled: selected.isEnabled,
            isServerActive: server?.isActive ?? true,
            isServerOnline: server ? online.has(server.id) : false,
            fault: fault(server?.id ?? "", selected.id),
          }),
          hasSubStream: selected.hasSubStream,
          analyticId: selected.analyticId,
          webrtcUrl: server?.webrtcUrl ?? null,
          webrtcUrlLocal: server?.webrtcUrlLocal ?? null,
        }}
        onClose={() => setSelectedKey(null)}
        details={
          selectedBodyworn && <BodywornDetails state={selectedBodyworn} />
        }
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
          online={online}
          isFaulty={isFaulty}
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
        online={online}
        isFaulty={isFaulty}
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
        trail={trail}
      />
    </PageShell>
  );
};

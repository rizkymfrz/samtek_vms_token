import { MapPinIcon } from "lucide-react";
import {
  PanelDetail,
  PanelSection,
  PanelSelected,
  PlacementAction,
} from "@/components/layout/side-panel";
import {
  DeviceTree,
  type DeviceTreeNode,
  matchesQuery,
} from "@/components/shared/device-tree";
import { Badge } from "@/components/ui/badge";
import type { DeviceState } from "@/lib/device-state";
import { markerKey } from "./map-canvas";
import type { MapMarker, MapPlace } from "../types";

const TYPE_LABEL = { group: "Group", server: "Edge server", device: "Camera" };

type Node = {
  key: string;
  place: MapPlace;
  marker: MapMarker | null;
};

const placeOf = (marker: MapMarker): MapPlace => ({
  type: marker.type,
  id: marker.id,
  name: marker.name,
  parentId:
    marker.type === "server"
      ? marker.groupId
      : marker.type === "device"
        ? marker.edgeServerId
        : null,
  isActive:
    marker.type === "server"
      ? marker.isActive
      : marker.type === "device"
        ? marker.isEnabled
        : true,
  analytic: marker.type === "device" ? marker.analytic : null,
});

const stateOf = (
  place: MapPlace,
  online: ReadonlySet<string>,
  isFaulty: (edgeId: string, deviceId: string) => boolean,
): DeviceState | null =>
  place.type === "group"
    ? null
    : place.type === "device" && !place.isActive
      ? "disabled"
      : !online.has(place.type === "server" ? place.id : (place.parentId ?? ""))
        ? "server-offline"
        : place.type === "device" && isFaulty(place.parentId ?? "", place.id)
          ? "stream-offline"
          : "live";

export const MapPanel = ({
  markers,
  online,
  isFaulty,
  unplaced,
  selectedKey,
  query,
  isBusy,
  placing,
  truncated,
  onQuery,
  onSelect,
  onPlacing,
  onRemove,
}: {
  markers: MapMarker[];
  online: ReadonlySet<string>;
  isFaulty: (edgeId: string, deviceId: string) => boolean;
  unplaced: MapPlace[];
  selectedKey: string | null;
  query: string;
  isBusy: boolean;
  placing: MapPlace | null;
  truncated: boolean;
  onQuery: (query: string) => void;
  onSelect: (marker: MapMarker) => void;
  onPlacing: (place: MapPlace | null) => void;
  onRemove: (marker: MapMarker) => void;
}) => {
  const nodes: Node[] = [
    ...markers.map((marker) => ({
      key: markerKey(marker),
      place: placeOf(marker),
      marker,
    })),
    ...unplaced.map((place) => ({
      key: `${place.type}:${place.id}`,
      place,
      marker: null,
    })),
  ];
  const ofType = (type: MapPlace["type"], parentId?: string | null) =>
    nodes.filter(
      (node) =>
        node.place.type === type &&
        (parentId === undefined || node.place.parentId === parentId),
    );
  const groupIds = new Set(ofType("group").map((node) => node.place.id));
  const matches = (node: Node) => matchesQuery(query, node.place.name);
  const devicesOf = (server: Node) =>
    ofType("device", server.place.id).filter(
      (device) => matches(server) || matches(device),
    );
  const hasMatch = (server: Node) =>
    matches(server) || devicesOf(server).length > 0;
  const serversOf = (group: Node | null) =>
    (group
      ? ofType("server", group.place.id)
      : ofType("server").filter(
          (node) => !node.place.parentId || !groupIds.has(node.place.parentId),
        )
    ).filter(hasMatch);
  const groups = ofType("group").filter(
    (group) => matches(group) || serversOf(group).length > 0,
  );
  const loose = serversOf(null);
  const selected = markers.find((m) => markerKey(m) === selectedKey);
  const name = (type: MapPlace["type"], id: string | null) =>
    nodes.find((n) => n.place.type === type && n.place.id === id)?.place.name ??
    "Unknown";
  const selectedPlace = selected ? placeOf(selected) : null;
  const selectedParent =
    selectedPlace?.parentId && selectedPlace.type !== "group"
      ? name(
          selectedPlace.type === "device" ? "server" : "group",
          selectedPlace.parentId,
        )
      : null;
  const renderActions = (node: Node) => {
    const { name } = node.place;
    if (!node.marker) {
      const isPlacing =
        placing?.type === node.place.type && placing.id === node.place.id;
      return (
        <PlacementAction
          isPlaced={false}
          addLabel={
            isPlacing ? `Cancel adding ${name}` : `Add ${name} to the map`
          }
          removeLabel=""
          isDisabled={isBusy}
          onClick={() => onPlacing(isPlacing ? null : node.place)}
        />
      );
    }
    const marker = node.marker;
    if (marker.type === "device" && marker.inherited) return null;
    return (
      <PlacementAction
        isPlaced
        addLabel=""
        removeLabel={`Remove ${name} from the map`}
        isDisabled={isBusy}
        onClick={() => onRemove(marker)}
      />
    );
  };
  const subtitle = (node: Node) =>
    placing?.type === node.place.type && placing.id === node.place.id
      ? "Click the map to add it"
      : (node.place.analytic ?? "No analytic");
  const toTree = (node: Node, children?: DeviceTreeNode[]): DeviceTreeNode => ({
    id: node.key,
    kind: node.place.type,
    title: node.place.name,
    subtitle:
      children === undefined
        ? subtitle(node)
        : `${children.length} ${node.place.type === "group" ? "servers" : "cameras"}`,
    state: stateOf(node.place, online, isFaulty) ?? undefined,
    isSelected: node.key === selectedKey,
    isMuted: !node.marker,
    onSelect: node.marker ? () => onSelect(node.marker!) : undefined,
    actions: renderActions(node),
    children,
  });
  const toServerTree = (server: Node) =>
    toTree(
      server,
      devicesOf(server).map((device) => toTree(device)),
    );
  const tree = [
    ...groups.map((group) => toTree(group, serversOf(group).map(toServerTree))),
    ...loose.map(toServerTree),
  ];
  return (
    <>
      {selected && selectedPlace && (
        <PanelSelected
          title={selected.name}
          state={stateOf(selectedPlace, online, isFaulty) ?? undefined}
        >
          <PanelDetail label="Type">{TYPE_LABEL[selected.type]}</PanelDetail>
          {selectedParent && (
            <PanelDetail
              label={selected.type === "device" ? "Edge server" : "Group"}
            >
              {selectedParent}
            </PanelDetail>
          )}
          <PanelDetail label="Latitude">
            <span className="tabular-nums">{selected.latitude.toFixed(6)}</span>
          </PanelDetail>
          <PanelDetail label="Longitude">
            <span className="tabular-nums">
              {selected.longitude.toFixed(6)}
            </span>
          </PanelDetail>
          {selected.type === "device" && selected.inherited && (
            <PanelDetail label="Location">
              <Badge variant="secondary">From edge server</Badge>
            </PanelDetail>
          )}
        </PanelSelected>
      )}
      <PanelSection title="Locations">
        <DeviceTree
          nodes={tree}
          query={query}
          onQuery={onQuery}
          noun="locations"
          emptyIcon={<MapPinIcon />}
        />
        {truncated && (
          <p className="text-xs text-muted-foreground">
            Only the first locations are shown. Zoom in to see more.
          </p>
        )}
      </PanelSection>
    </>
  );
};

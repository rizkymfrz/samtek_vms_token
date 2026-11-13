import {
  CctvIcon,
  ChevronDownIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  SearchXIcon,
  ServerIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  PanelDetail,
  PanelEmpty,
  PanelIconAction,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { markerKey } from "./map-canvas";
import type { MapMarker, MapPlace } from "../types";

const TYPE_LABEL = { group: "Group", server: "Edge server", device: "Camera" };
const ICON = { group: MapPinIcon, server: ServerIcon, device: CctvIcon };

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
});

const stateLabel = (node: Node) =>
  node.place.type === "group"
    ? null
    : node.place.isActive
      ? "Active"
      : node.place.type === "server"
        ? "Inactive"
        : "Disabled";

export const MapPanel = ({
  markers,
  unplaced,
  selectedKey,
  query,
  isLive,
  isBusy,
  placing,
  truncated,
  onQuery,
  onSelect,
  onPlacing,
  onRemove,
}: {
  markers: MapMarker[];
  unplaced: MapPlace[];
  selectedKey: string | null;
  query: string;
  isLive: boolean;
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
  const needle = query.trim().toLowerCase();
  const matches = (node: Node) =>
    !needle || node.place.name.toLowerCase().includes(needle);
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
  const isEmpty = groups.length === 0 && loose.length === 0;
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
    if (!isLive) return null;
    if (!node.marker) {
      const isPlacing =
        placing?.type === node.place.type && placing.id === node.place.id;
      return (
        <PanelIconAction
          label={
            isPlacing
              ? `Cancel placing ${node.place.name}`
              : `Place ${node.place.name} on the map`
          }
          isDisabled={isBusy}
          onClick={() => onPlacing(isPlacing ? null : node.place)}
        >
          <PlusIcon />
        </PanelIconAction>
      );
    }
    const marker = node.marker;
    if (marker.type === "device" && marker.inherited) return null;
    return (
      <PanelIconAction
        label={`Remove ${node.place.name} from the map`}
        isDisabled={isBusy}
        onClick={() => onRemove(marker)}
      >
        <MinusIcon />
      </PanelIconAction>
    );
  };
  const subtitle = (node: Node) =>
    placing?.type === node.place.type && placing.id === node.place.id
      ? "Click the map to place it"
      : !node.marker
        ? "Not on the map"
        : (stateLabel(node) ?? "On the map");
  const renderLeaf = (node: Node) => {
    const Icon = ICON[node.place.type];
    const isSelected = node.key === selectedKey;
    return (
      <li key={node.key} className="flex items-center gap-2 py-1 pl-8">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <NodeButton node={node} isSelected={isSelected} onSelect={onSelect}>
          {subtitle(node)}
        </NodeButton>
        <StatusDot status={node.place.isActive ? "live" : "offline"} />
        {renderActions(node)}
      </li>
    );
  };
  const renderBranch = (
    node: Node,
    children: ReactNode,
    count: number,
    indent: string,
  ) => {
    const Icon = ICON[node.place.type];
    return (
      <Collapsible
        key={node.key}
        defaultOpen
        className={cn("border-b last:border-b-0", indent)}
      >
        <div className="flex items-center gap-2 py-2">
          <CollapsibleTrigger
            aria-label={`Toggle ${node.place.name}`}
            className="group flex size-4 shrink-0 items-center justify-center outline-none focus-visible:text-foreground"
          >
            <ChevronDownIcon className="size-4 -rotate-90 text-muted-foreground transition-transform group-aria-expanded:rotate-0" />
          </CollapsibleTrigger>
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <NodeButton
            node={node}
            isSelected={node.key === selectedKey}
            onSelect={onSelect}
            isTitle
          >
            {count} {node.place.type === "group" ? "servers" : "cameras"}
          </NodeButton>
          {node.place.type !== "group" && (
            <StatusDot status={node.place.isActive ? "live" : "offline"} />
          )}
          {renderActions(node)}
        </div>
        <CollapsibleContent>{children}</CollapsibleContent>
      </Collapsible>
    );
  };
  const renderServer = (server: Node, indent: string) => {
    const devices = devicesOf(server);
    return renderBranch(
      server,
      <ul className="flex flex-col pb-2">{devices.map(renderLeaf)}</ul>,
      devices.length,
      indent,
    );
  };
  return (
    <>
      {selected && selectedPlace && (
        <section className="flex flex-col gap-2 rounded border p-4">
          <span className="truncate text-sm font-medium">{selected.name}</span>
          <PanelDetail label="Type">{TYPE_LABEL[selected.type]}</PanelDetail>
          {selected.type !== "group" && (
            <PanelDetail label="Status">
              <StatusDot status={selectedPlace.isActive ? "live" : "offline"} />
              {selectedPlace.isActive
                ? "Active"
                : selected.type === "server"
                  ? "Inactive"
                  : "Disabled"}
            </PanelDetail>
          )}
          {selectedParent && (
            <PanelDetail
              label={selected.type === "device" ? "Edge server" : "Group"}
            >
              {selectedParent}
            </PanelDetail>
          )}
          <PanelDetail label="Latitude">
            <span className="tabular-nums">{selected.latitude.toFixed(5)}</span>
          </PanelDetail>
          <PanelDetail label="Longitude">
            <span className="tabular-nums">
              {selected.longitude.toFixed(5)}
            </span>
          </PanelDetail>
          {selected.type === "device" && selected.inherited && (
            <PanelDetail label="Location">
              <Badge variant="secondary">From server</Badge>
            </PanelDetail>
          )}
        </section>
      )}
      <PanelSection title="Locations">
        <PanelSearch
          value={query}
          onChange={onQuery}
          placeholder="Search locations..."
        />
        <div className="flex flex-col">
          {groups.map((group) =>
            renderBranch(
              group,
              <div className="pl-4">
                {serversOf(group).map((server) => renderServer(server, ""))}
              </div>,
              serversOf(group).length,
              "",
            ),
          )}
          {loose.map((server) => renderServer(server, ""))}
          {isEmpty && (
            <PanelEmpty
              icon={needle ? <SearchXIcon /> : <MapPinIcon />}
              title={needle ? "No locations match" : "No locations"}
              description={needle ? "Try a different search." : undefined}
            />
          )}
        </div>
        {truncated && (
          <p className="text-xs text-muted-foreground">
            Only the first locations are shown. Zoom in to see more.
          </p>
        )}
      </PanelSection>
    </>
  );
};

const NodeButton = ({
  node,
  isSelected,
  isTitle,
  onSelect,
  children,
}: {
  node: Node;
  isSelected: boolean;
  isTitle?: boolean;
  onSelect: (marker: MapMarker) => void;
  children: ReactNode;
}) => {
  const { marker } = node;
  return (
    <button
      type="button"
      disabled={!marker}
      aria-pressed={isSelected}
      onClick={() => marker && onSelect(marker)}
      className="flex min-w-0 flex-1 flex-col text-left outline-none enabled:hover:underline focus-visible:underline"
    >
      <span
        className={cn(
          "truncate",
          isTitle ? "text-sm font-medium" : "text-xs",
          isSelected && "font-medium",
          !marker && "text-muted-foreground",
        )}
      >
        {node.place.name}
      </span>
      <span className="truncate text-xs font-normal text-muted-foreground">
        {children}
      </span>
    </button>
  );
};

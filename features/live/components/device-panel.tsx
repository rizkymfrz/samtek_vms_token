"use client";
import { ListMinusIcon, ListPlusIcon } from "lucide-react";
import { useState } from "react";
import {
  PanelIconAction,
  PanelPicker,
  PanelSection,
  PlacementAction,
} from "@/components/layout/side-panel";
import {
  DeviceTree,
  type DeviceTreeNode,
  matchesQuery,
} from "@/components/shared/device-tree";
import { freeSlots } from "../lib/edit-layout";
import type { LiveLayout, LiveLayoutSummary, ServerNode, Tile } from "../types";

export const DevicePanel = ({
  layouts,
  layout,
  servers,
  tiles,
  readOnly,
  onSelectLayout,
  onNewLayout,
  onDeleteLayout,
  onAdd,
  onRemove,
}: {
  layouts: LiveLayoutSummary[];
  layout: LiveLayout;
  servers: ServerNode[];
  tiles: Tile[];
  readOnly: boolean;
  onSelectLayout: (id: string) => void;
  onNewLayout: () => void;
  onDeleteLayout: () => void;
  onAdd: (ids: string[]) => void;
  onRemove: (ids: string[]) => void;
}) => {
  const [query, setQuery] = useState("");
  const inLayout = new Set(layout.slots);
  const full = freeSlots(layout) === 0;
  const layoutItems = layouts.map((l) => ({
    value: l.id,
    label: `${l.name} · ${l.rows}×${l.columns}`,
  }));
  const tree: DeviceTreeNode[] = servers.flatMap((server) => {
    const cameras = tiles.filter(
      (tile) =>
        tile.serverId === server.id &&
        matchesQuery(query, tile.name, tile.analytic),
    );
    if (cameras.length === 0) return [];
    const ids = cameras.map((tile) => tile.id);
    const placed = ids.filter((id) => inLayout.has(id)).length;
    return {
      id: server.id,
      kind: "server",
      title: server.name,
      subtitle: `${placed}/${cameras.length} in layout`,
      state: server.online ? "live" : "server-offline",
      actions: (
        <>
          <PanelIconAction
            label={`Add all ${server.name} cameras`}
            isDisabled={readOnly || full || placed === cameras.length}
            onClick={() => onAdd(ids)}
          >
            <ListPlusIcon />
          </PanelIconAction>
          <PanelIconAction
            label={`Remove all ${server.name} cameras`}
            isDisabled={readOnly || placed === 0}
            onClick={() => onRemove(ids)}
          >
            <ListMinusIcon />
          </PanelIconAction>
        </>
      ),
      children: cameras.map((tile) => {
        const added = inLayout.has(tile.id);
        return {
          id: tile.id,
          kind: "device",
          title: tile.name,
          subtitle: tile.analytic ?? "No analytic",
          state: tile.state,
          isMuted: !added,
          actions: (
            <PlacementAction
              isPlaced={added}
              addLabel={`Add ${tile.name} to layout`}
              removeLabel={`Remove ${tile.name} from layout`}
              isDisabled={readOnly || (!added && full)}
              onClick={() => (added ? onRemove([tile.id]) : onAdd([tile.id]))}
            />
          ),
        };
      }),
    };
  });
  return (
    <>
      <PanelPicker
        title="Layout"
        items={layoutItems}
        value={layout.id}
        onChange={onSelectLayout}
        actions={{
          createLabel: "New layout",
          deleteLabel: "Delete layout",
          isDeleteDisabled: layouts.length === 1,
          onCreate: onNewLayout,
          onDelete: onDeleteLayout,
        }}
      />
      <PanelSection title="Cameras">
        <DeviceTree
          nodes={tree}
          query={query}
          onQuery={setQuery}
          noun="cameras"
        />
        {full && (
          <p className="text-xs text-muted-foreground">
            The layout is full. Remove a camera or pick a bigger grid.
          </p>
        )}
      </PanelSection>
    </>
  );
};

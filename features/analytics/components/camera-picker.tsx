"use client";
import { isServerDown } from "@/lib/device-state";
import { useState } from "react";
import { PanelSection } from "@/components/layout/side-panel";
import {
  DeviceTree,
  type DeviceTreeNode,
  matchesQuery,
} from "@/components/shared/device-tree";
import { StatusDot } from "@/components/shared/status-dot";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Tile } from "@/features/live";
import { deviceDot } from "@/lib/device-state";

export const CameraPicker = ({
  tiles,
  selectedId,
  onSelect,
}: {
  tiles: Tile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const tree = [...new Set(tiles.map((tile) => tile.serverId))].flatMap(
    (serverId): DeviceTreeNode[] => {
      const cameras = tiles.filter(
        (tile) =>
          tile.serverId === serverId &&
          matchesQuery(query, tile.name, tile.analytic),
      );
      if (cameras.length === 0) return [];
      const isOnline = cameras.some((tile) => !isServerDown(tile.state));
      return [
        {
          id: serverId,
          kind: "server",
          title: cameras[0].serverName,
          subtitle: `${cameras.length} ${cameras.length === 1 ? "camera" : "cameras"}`,
          state: isOnline ? "live" : cameras[0].state,
          children: cameras.map((tile) => ({
            id: tile.id,
            kind: "device",
            title: tile.name,
            subtitle: tile.analytic ?? "No analytic",
            isSelected: tile.id === selectedId,
            onSelect: () => onSelect(tile.id),
            actions: (
              <>
                <StatusDot status={deviceDot(tile.state)} />
                <RadioGroupItem
                  value={tile.id}
                  aria-label={`Select ${tile.name}`}
                />
              </>
            ),
          })),
        },
      ];
    },
  );
  return (
    <PanelSection title="Cameras">
      <RadioGroup
        value={selectedId ?? ""}
        onValueChange={(value) => onSelect(String(value))}
        className="block"
      >
        <DeviceTree
          nodes={tree}
          query={query}
          onQuery={setQuery}
          noun="cameras"
        />
      </RadioGroup>
    </PanelSection>
  );
};

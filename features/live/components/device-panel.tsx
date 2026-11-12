"use client";
import {
  ChevronDownIcon,
  ListMinusIcon,
  ListPlusIcon,
  MinusIcon,
  PlusIcon,
  SearchXIcon,
  ServerIcon,
  VideoIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  PanelActions,
  PanelEmpty,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { freeSlots } from "../lib/edit-layout";
import type { LiveLayout, LiveLayoutSummary, ServerNode, Tile } from "../types";

const IconAction = ({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

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
  const needle = query.trim().toLowerCase();
  const layoutItems = layouts.map((l) => ({
    value: l.id,
    label: `${l.name} · ${l.rows}×${l.columns}`,
  }));
  return (
    <>
      <PanelSection title="Layout">
        <Pick
          label="Layout"
          items={layoutItems}
          value={layout.id}
          onChange={onSelectLayout}
          className="w-full"
        />
        <PanelActions
          createLabel="New layout"
          deleteLabel="Delete layout"
          isDeleteDisabled={layouts.length === 1}
          onCreate={onNewLayout}
          onDelete={onDeleteLayout}
        />
      </PanelSection>
      <PanelSection title="Cameras">
        <PanelSearch
          value={query}
          onChange={setQuery}
          placeholder="Search cameras..."
        />
        <div className="flex flex-col">
          {servers.map((server) => {
            const cameras = tiles.filter(
              (tile) =>
                tile.serverId === server.id &&
                (!needle ||
                  `${tile.name} ${tile.analytic ?? ""}`
                    .toLowerCase()
                    .includes(needle)),
            );
            if (cameras.length === 0) return null;
            const ids = cameras.map((tile) => tile.id);
            const placed = ids.filter((id) => inLayout.has(id)).length;
            return (
              <Collapsible
                key={server.id}
                defaultOpen
                className="border-b last:border-b-0"
              >
                <div className="flex items-center gap-2 py-2">
                  <CollapsibleTrigger className="group flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium outline-none focus-visible:underline">
                    <ChevronDownIcon className="size-4 shrink-0 -rotate-90 text-muted-foreground transition-transform group-aria-expanded:rotate-0" />
                    <ServerIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{server.name}</span>
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">
                      {placed}/{cameras.length}
                    </span>
                  </CollapsibleTrigger>
                  <StatusDot status={server.online ? "live" : "offline"} />
                  <IconAction
                    label={`Add all ${server.name} cameras`}
                    disabled={readOnly || full || placed === cameras.length}
                    onClick={() => onAdd(ids)}
                  >
                    <ListPlusIcon />
                  </IconAction>
                  <IconAction
                    label={`Remove all ${server.name} cameras`}
                    disabled={readOnly || placed === 0}
                    onClick={() => onRemove(ids)}
                  >
                    <ListMinusIcon />
                  </IconAction>
                </div>
                <CollapsibleContent>
                  <ul className="flex flex-col pb-2">
                    {cameras.map((tile) => {
                      const added = inLayout.has(tile.id);
                      return (
                        <li
                          key={tile.id}
                          className="flex items-center gap-2 py-1 pl-8"
                        >
                          <VideoIcon className="size-4 shrink-0 text-muted-foreground" />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span
                              className={cn(
                                "truncate text-xs",
                                !added && "text-muted-foreground",
                              )}
                            >
                              {tile.name}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {tile.state === "disabled"
                                ? "Disabled"
                                : tile.state === "server-offline"
                                  ? "Server offline"
                                  : (tile.analytic ?? "No analytic")}
                            </span>
                          </div>
                          <StatusDot
                            status={tile.state === "live" ? "live" : "offline"}
                          />
                          {added ? (
                            <IconAction
                              label={`Remove ${tile.name} from layout`}
                              disabled={readOnly}
                              onClick={() => onRemove([tile.id])}
                            >
                              <MinusIcon />
                            </IconAction>
                          ) : (
                            <IconAction
                              label={`Add ${tile.name} to layout`}
                              disabled={readOnly || full}
                              onClick={() => onAdd([tile.id])}
                            >
                              <PlusIcon />
                            </IconAction>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          {needle &&
            !tiles.some((tile) =>
              `${tile.name} ${tile.analytic ?? ""}`
                .toLowerCase()
                .includes(needle),
            ) && (
              <PanelEmpty
                icon={<SearchXIcon />}
                title="No cameras match"
                description="Try a different search."
              />
            )}
        </div>
        {full && (
          <p className="text-xs text-muted-foreground">
            The layout is full. Remove a camera or pick a bigger grid.
          </p>
        )}
      </PanelSection>
    </>
  );
};

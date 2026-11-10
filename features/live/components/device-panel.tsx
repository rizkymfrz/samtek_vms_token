"use client";
import {
  ChevronDownIcon,
  ListMinusIcon,
  ListPlusIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { freeSlots } from "../lib/edit-layout";
import type { LiveLayout, ServerNode, Tile } from "../types";

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
  onSelectLayout,
  onNewLayout,
  onDeleteLayout,
  onAdd,
  onRemove,
}: {
  layouts: LiveLayout[];
  layout: LiveLayout;
  servers: ServerNode[];
  tiles: Tile[];
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
    <div className="flex flex-col gap-4 p-4">
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Layout
        </span>
        <div className="flex items-center gap-2">
          <Select
            items={layoutItems}
            value={layout.id}
            onValueChange={(value) => onSelectLayout(String(value))}
          >
            <SelectTrigger className="min-w-0 flex-1" aria-label="Layout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {layoutItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <IconAction label="New layout" onClick={onNewLayout}>
            <PlusIcon />
          </IconAction>
          <IconAction
            label="Delete layout"
            disabled={layouts.length === 1}
            onClick={onDeleteLayout}
          >
            <Trash2Icon />
          </IconAction>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Cameras
        </span>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cameras..."
            aria-label="Search cameras"
            className="pl-8"
          />
        </div>
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
                    <StatusDot status={server.online ? "live" : "offline"} />
                    <span className="truncate">{server.name}</span>
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">
                      {placed}/{cameras.length}
                    </span>
                  </CollapsibleTrigger>
                  <IconAction
                    label={`Add all ${server.name} cameras`}
                    disabled={full || placed === cameras.length}
                    onClick={() => onAdd(ids)}
                  >
                    <ListPlusIcon />
                  </IconAction>
                  <IconAction
                    label={`Remove all ${server.name} cameras`}
                    disabled={placed === 0}
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
                          <StatusDot
                            status={tile.state === "live" ? "live" : "offline"}
                          />
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
                          {added ? (
                            <IconAction
                              label={`Remove ${tile.name} from layout`}
                              onClick={() => onRemove([tile.id])}
                            >
                              <MinusIcon />
                            </IconAction>
                          ) : (
                            <IconAction
                              label={`Add ${tile.name} to layout`}
                              disabled={full}
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
              <p className="py-4 text-center text-xs text-muted-foreground">
                No cameras match.
              </p>
            )}
        </div>
        {full && (
          <p className="text-xs text-muted-foreground">
            The layout is full. Remove a camera or pick a bigger grid.
          </p>
        )}
      </section>
    </div>
  );
};

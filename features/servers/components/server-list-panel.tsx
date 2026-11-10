import {
  CctvIcon,
  Loader2Icon,
  PlusIcon,
  RadarIcon,
  ServerIcon,
} from "lucide-react";
import { PanelEmpty, PanelSection } from "@/components/layout/side-panel";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Discovered, ServerRecord } from "../types";

export type DiscoverTab = "registered" | "discovered";

export const ServerListPanel = ({
  servers,
  online,
  selectedId,
  discovered,
  tab,
  scanning,
  onSelect,
  onAdd,
  onTab,
  isLive,
  onScan,
  onRegister,
}: {
  servers: ServerRecord[];
  online: Set<string>;
  selectedId: string | null;
  discovered: Discovered[];
  isLive: boolean;
  tab: DiscoverTab;
  scanning: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onTab: (tab: DiscoverTab) => void;
  onScan: () => void;
  onRegister: (id: string) => void;
}) => {
  const registered = discovered.filter((d) => d.registeredServerId);
  const pending = discovered.filter((d) => !d.registeredServerId);
  const shown = tab === "registered" ? registered : pending;
  return (
    <>
      <PanelSection title="Servers">
        {servers.length === 0 && <PanelEmpty>No servers yet.</PanelEmpty>}
        <ul className="flex flex-col gap-2">
          {servers.map((server) => (
            <li key={server.id}>
              <button
                type="button"
                aria-pressed={server.id === selectedId}
                onClick={() => onSelect(server.id)}
                className={cn(
                  "relative flex w-full items-center gap-2 border p-2 text-left outline-none before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-primary before:opacity-0 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  server.id === selectedId &&
                    "border-transparent bg-accent before:opacity-100",
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center bg-muted text-muted-foreground">
                  <ServerIcon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium">
                    {server.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {server.vendor ?? server.code}
                  </span>
                </span>
                <StatusDot
                  shape="square"
                  status={online.has(server.id) ? "live" : "offline"}
                  role="img"
                  aria-label={online.has(server.id) ? "Online" : "Offline"}
                />
              </button>
            </li>
          ))}
        </ul>
        <Button onClick={onAdd} className="w-full">
          <PlusIcon />
          Add server
        </Button>
      </PanelSection>
      {!isLive && (
        <PanelSection
          title="Registered / Discovered"
          shouldGrow
          action={
            <Button
              variant="secondary"
              size="xs"
              onClick={onScan}
              disabled={scanning}
            >
              {scanning ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <RadarIcon />
              )}
              {scanning ? "Scanning" : "Scan"}
            </Button>
          }
        >
          <Tabs
            value={tab}
            onValueChange={(value) => onTab(value as DiscoverTab)}
          >
            <TabsList variant="line" className="w-full">
              <TabsTrigger value="registered">
                Registered {registered.length}
              </TabsTrigger>
              <TabsTrigger value="discovered">
                Discovered {pending.length}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <ul className="flex flex-col gap-2">
            {shown.length === 0 && (
              <li>
                <PanelEmpty>
                  {tab === "registered"
                    ? "Nothing registered from a scan yet."
                    : "No new devices. Scan the network to look again."}
                </PanelEmpty>
              </li>
            )}
            {shown.map((device) => (
              <li
                key={device.id}
                className="flex items-center gap-2 border p-2"
              >
                <CctvIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium">
                    {device.id}
                  </span>{" "}
                  <span className="truncate text-xs text-muted-foreground">
                    {device.ip} · {device.vendor}
                  </span>
                </span>
                {device.registeredServerId ? (
                  <Button
                    variant="link"
                    size="xs"
                    onClick={() => onSelect(device.registeredServerId!)}
                  >
                    Open
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onRegister(device.id)}
                  >
                    Register
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </PanelSection>
      )}
    </>
  );
};

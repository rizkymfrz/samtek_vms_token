"use client";
import * as React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { LogSheet } from "./log-sheet";
import { ServerFormSheet, type FormTarget } from "./server-form-sheet";
import { ServerListPanel, type DiscoverTab } from "./server-list-panel";
import { ServerDetail } from "./server-detail";
import type { Discovered, ServersData } from "../types";
import { isOnline } from "../lib/server-status";
import {
  saveServer,
  removeServer,
  registerDiscovered,
  type Draft,
} from "../lib/edit-server";

const SCAN_POOL: Omit<Discovered, "registeredServerId">[] = [
  { id: "edge-c4d9", ip: "192.168.1.71", vendor: "SAMTEK Edge" },
  { id: "smartbox-e803", ip: "192.168.1.72", vendor: "SmartBox" },
  { id: "nvr-5b17", ip: "192.168.1.73", vendor: "Hikvision" },
];

const RESTART_MS = 4000;
const SCAN_MS = 1500;

export const ServersView = ({ data }: { data: ServersData }) => {
  const [servers, setServers] = React.useState(data.servers);
  const [discovered, setDiscovered] = React.useState(data.discovered);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    data.servers[0]?.id ?? null,
  );
  const [tab, setTab] = React.useState<DiscoverTab>("discovered");
  const [scanning, setScanning] = React.useState(false);
  const [scanCount, setScanCount] = React.useState(0);
  const [restartingId, setRestartingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormTarget>(null);
  const [logsOpen, setLogsOpen] = React.useState(false);
  const online = React.useMemo(
    () =>
      new Set(servers.filter((s) => isOnline(s, data.now)).map((s) => s.id)),
    [servers, data.now],
  );
  const selected = servers.find((s) => s.id === selectedId) ?? null;
  React.useEffect(() => {
    if (!restartingId) return;
    const timer = setTimeout(() => setRestartingId(null), RESTART_MS);
    return () => clearTimeout(timer);
  }, [restartingId]);
  React.useEffect(() => {
    if (!scanning) return;
    const timer = setTimeout(() => {
      const next = SCAN_POOL[scanCount];
      if (next) {
        setDiscovered((all) =>
          all.some((d) => d.id === next.id)
            ? all
            : [...all, { ...next, registeredServerId: null }],
        );
        setScanCount((count) => count + 1);
      }
      setScanning(false);
      setTab("discovered");
    }, SCAN_MS);
    return () => clearTimeout(timer);
  }, [scanning, scanCount]);
  const save = (draft: Draft, id: string | null) => {
    const next = saveServer(servers, draft, id);
    setServers(next);
    if (id === null) setSelectedId(next[next.length - 1].id);
    setForm(null);
  };
  return (
    <PageShell>
      <SidePanel>
        <ServerListPanel
          servers={servers}
          online={online}
          selectedId={selectedId}
          discovered={discovered}
          tab={tab}
          scanning={scanning}
          onSelect={setSelectedId}
          onAdd={() => setForm("new")}
          onTab={setTab}
          onScan={() => setScanning(true)}
          onRegister={(deviceId) => {
            const result = registerDiscovered(
              servers,
              discovered,
              deviceId,
              data.now,
            );
            if (!result.serverId) return;
            setServers(result.servers);
            setDiscovered(result.discovered);
            setSelectedId(result.serverId);
            setTab("registered");
          }}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0 lg:overflow-y-auto">
        {selected ? (
          <ServerDetail
            key={selected.id}
            server={selected}
            groups={data.groups}
            online={online.has(selected.id)}
            restarting={restartingId === selected.id}
            metrics={data.metrics[selected.id] ?? null}
            onLogs={() => setLogsOpen(true)}
            onEdit={() => setForm(selected)}
            onRestart={() => setRestartingId(selected.id)}
            onDelete={() => {
              const rest = removeServer(servers, selected.id);
              setServers(rest);
              setSelectedId(rest[0]?.id ?? null);
            }}
          />
        ) : (
          <p className="flex flex-1 items-center justify-center border text-xs text-muted-foreground max-lg:py-16">
            {servers.length === 0
              ? "No servers yet. Add one, or register a discovered device."
              : "Choose a server."}
          </p>
        )}
      </div>
      <ServerFormSheet
        target={form}
        servers={servers}
        groups={data.groups}
        onSave={save}
        onClose={() => setForm(null)}
      />
      <LogSheet
        server={
          logsOpen && selected ? { id: selected.id, name: selected.name } : null
        }
        online={selected ? online.has(selected.id) : false}
        startedAt={data.now}
        onClose={() => setLogsOpen(false)}
      />
    </PageShell>
  );
};

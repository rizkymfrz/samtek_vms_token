"use client";
import { ServerIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { mqttConfig } from "@/config/mqtt";
import { isServerOnline } from "@/config/server-status";
import { useEdgeStatus, useServerOnline } from "@/features/edge-status";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { DeleteServerDialog } from "./delete-server-dialog";
import { LogDialog } from "./log-dialog";
import { ServerDetail } from "./server-detail";
import { type FormTarget, ServerFormDialog } from "./server-form-dialog";
import { type DiscoverTab, ServerListPanel } from "./server-list-panel";
import { useServerActions } from "../hooks/use-server-actions";
import { useServers } from "../hooks/use-servers";
import { toMetrics } from "../lib/edge-metrics";
import { type Draft, registerDiscovered } from "../lib/edit-server";
import type { Discovered, ServersData } from "../types";

const SCAN_POOL: Omit<Discovered, "registeredServerId">[] = [
  { id: "edge-c4d9", ip: "192.168.1.71", vendor: "SAMTEK Edge" },
  { id: "smartbox-e803", ip: "192.168.1.72", vendor: "SmartBox" },
  { id: "nvr-5b17", ip: "192.168.1.73", vendor: "Hikvision" },
];

const RESTART_MS = 4000;
const SCAN_MS = 1500;

export const ServersView = ({
  data,
  isLive,
}: {
  data: ServersData;
  isLive: boolean;
}) => {
  const { data: current } = useServers(data, isLive);
  const { servers, groups, metrics, failures, now } = current;
  useFailureToast(
    "Some data did not load",
    failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const actions = useServerActions(isLive);
  const [discovered, setDiscovered] = useState(data.discovered);
  const linkedId = useSearchParams().get("id");
  const [selectedId, setSelectedId] = useState<string | null>(
    linkedId ?? data.servers[0]?.id ?? null,
  );
  const [syncedId, setSyncedId] = useState(linkedId);
  if (linkedId !== syncedId) {
    setSyncedId(linkedId);
    if (linkedId) setSelectedId(linkedId);
  }
  const [tab, setTab] = useState<DiscoverTab>("discovered");
  const [scanning, setScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [restartingId, setRestartingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormTarget>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { entries, recording, error: brokerError } = useEdgeStatus();
  useFailureToast(
    "Failed to reach the MQTT broker",
    mqttConfig && brokerError
      ? [`Edge server status and metrics are unavailable. ${brokerError}`]
      : [],
  );
  useFailureToast("Failed to restart Edge", [actions.restartEdgeError]);
  useFailureToast("Failed to delete the edge server", [actions.removeError]);
  const serverOnline = useServerOnline();
  const online = useMemo(
    () =>
      new Set(
        servers
          .filter((s) => serverOnline(s, isServerOnline(s, now)))
          .map((s) => s.id),
      ),
    [servers, now, serverOnline],
  );
  const selected =
    servers.find((s) => s.id === selectedId) ?? servers[0] ?? null;
  const router = useRouter();
  const selectedKey = selected?.id ?? null;
  useEffect(() => {
    if (selectedKey && selectedKey !== linkedId)
      router.replace(`/servers?id=${selectedKey}`, { scroll: false });
  }, [selectedKey, linkedId, router]);
  const entry = selected ? entries.get(selected.id) : undefined;
  const selectedMetrics = entry
    ? toMetrics(entry, recording.get(selected?.id ?? "")?.retentionDays ?? null)
    : selected
      ? (metrics[selected.id] ?? null)
      : null;
  useEffect(() => {
    if (!restartingId) return;
    const timer = setTimeout(() => setRestartingId(null), RESTART_MS);
    return () => clearTimeout(timer);
  }, [restartingId]);
  useEffect(() => {
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
  const save = async (draft: Draft, id: string | null) => {
    try {
      const savedId = await actions.save.mutateAsync({ draft, id });
      if (id === null) setSelectedId(savedId);
      setForm(null);
    } catch {
      return;
    }
  };
  const remove = async (id: string) => {
    const rest = servers.filter((server) => server.id !== id);
    try {
      await actions.remove.mutateAsync(id);
      setSelectedId(rest[0]?.id ?? null);
    } catch {
      return;
    }
  };
  return (
    <PageShell>
      <SidePanel>
        <ServerListPanel
          servers={servers}
          online={online}
          selectedId={selected?.id ?? null}
          discovered={discovered}
          tab={tab}
          scanning={scanning}
          onSelect={setSelectedId}
          onAdd={() => setForm("new")}
          onDelete={() => setIsDeleting(true)}
          onTab={setTab}
          isLive={isLive}
          onScan={() => setScanning(true)}
          onRegister={(deviceId) => {
            const result = registerDiscovered(
              servers,
              discovered,
              deviceId,
              now,
            );
            if (!result.serverId) return;
            actions.replaceServers(() => result.servers);
            setDiscovered(result.discovered);
            setSelectedId(result.serverId);
            setTab("registered");
          }}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0 lg:overflow-y-auto">
        {selected ? (
          <ServerDetail
            key={selected.id}
            server={selected}
            isLive={isLive}
            online={online.has(selected.id)}
            restarting={restartingId === selected.id}
            metrics={selectedMetrics}
            onLogs={() => setLogsOpen(true)}
            onEdit={() => setForm(selected)}
            isRestartingEdge={actions.restartEdge.isPending}
            onRestart={() => setRestartingId(selected.id)}
            onRestartEdge={() => actions.restartEdge.mutate(selected)}
            onDelete={() => setIsDeleting(true)}
          />
        ) : (
          <EmptyState
            icon={<ServerIcon />}
            title={
              servers.length === 0
                ? "No edge servers"
                : "No edge server selected"
            }
            description={
              servers.length === 0
                ? "Add one, or register a discovered device."
                : "Choose an edge server from the list."
            }
          />
        )}
      </div>
      <ServerFormDialog
        target={form}
        groups={groups}
        isPending={actions.save.isPending}
        error={actions.saveError}
        groupAction={{
          isPending: actions.addGroup.isPending,
          error: actions.addGroupError,
          create: actions.addGroup.mutateAsync,
          reset: actions.addGroup.reset,
        }}
        onSave={save}
        onClose={() => {
          setForm(null);
          actions.save.reset();
        }}
      />
      <DeleteServerDialog
        server={selected}
        isOpen={isDeleting}
        onOpenChange={setIsDeleting}
        onConfirm={() => selected && remove(selected.id)}
      />
      <LogDialog
        server={
          logsOpen && selected ? { id: selected.id, name: selected.name } : null
        }
        online={selected ? online.has(selected.id) : false}
        startedAt={now}
        onClose={() => setLogsOpen(false)}
      />
    </PageShell>
  );
};

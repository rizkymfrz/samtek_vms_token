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
import { ServerDetail } from "./server-detail";
import { type FormTarget, ServerFormDialog } from "./server-form-dialog";
import { ServerListPanel } from "./server-list-panel";
import { useServerActions } from "../hooks/use-server-actions";
import { useServers } from "../hooks/use-servers";
import { toMetrics } from "../lib/edge-metrics";
import type { Draft } from "../lib/edit-server";
import type { ServersData } from "../types";

export const ServersView = ({ data }: { data: ServersData }) => {
  const { data: current } = useServers(data);
  const { servers, groups, failures, now } = current;
  useFailureToast(
    "Some data did not load",
    failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const actions = useServerActions();
  const linkedId = useSearchParams().get("id");
  const [selectedId, setSelectedId] = useState<string | null>(
    linkedId ?? data.servers[0]?.id ?? null,
  );
  const [syncedId, setSyncedId] = useState(linkedId);
  if (linkedId !== syncedId) {
    setSyncedId(linkedId);
    if (linkedId) setSelectedId(linkedId);
  }
  const [form, setForm] = useState<FormTarget>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { entries, recording, error: brokerError } = useEdgeStatus();
  useFailureToast(
    "Failed to reach the MQTT broker",
    mqttConfig && brokerError
      ? [`Edge server status and metrics are unavailable. ${brokerError}`]
      : [],
  );
  useFailureToast("Failed to restart the edge server", [
    actions.restartEdgeError,
  ]);
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
    : null;
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
          onSelect={setSelectedId}
          onAdd={() => setForm("new")}
          onDelete={() => setIsDeleting(true)}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0 lg:overflow-y-auto">
        {selected ? (
          <ServerDetail
            key={selected.id}
            server={selected}
            online={online.has(selected.id)}
            metrics={selectedMetrics}
            onEdit={() => setForm(selected)}
            isRestartingEdge={actions.restartEdge.isPending}
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
                ? "Add one to get started."
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
    </PageShell>
  );
};

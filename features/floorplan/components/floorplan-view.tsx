"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderIcon, LayersIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import {
  PanelEmpty,
  PanelSection,
  SidePanel,
} from "@/components/layout/side-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useServerOnline } from "@/features/edge-status";
import { useFailureToast } from "@/hooks/use-failure-toast";
import { messageOf } from "@/lib/axios/browser-client";
import { DeleteFloorplanDialog } from "./delete-floorplan-dialog";
import {
  type FloorplanDraft,
  FloorplanFormDialog,
} from "./floorplan-form-dialog";
import { FloorplanPanel } from "./floorplan-panel";
import { PlanCanvas } from "./plan-canvas";
import { FLOORPLAN_QUERY_KEY, useFloorplan } from "../hooks/use-floorplan";
import {
  groupScope,
  moveCamera,
  placeCamera,
  removeCamera,
  rotateCamera,
  setFov,
} from "../lib/edit-placements";
import {
  createFloorplanRequest,
  deleteFloorplanRequest,
  replacePlacementsRequest,
  uploadImageRequest,
} from "../services/floorplan-api";
import type { FloorplanData, FloorplanDevice, PlanCamera } from "../types";

const AUTOSAVE_MS = 600;

const reportFailure = (title: string) => (error: unknown) =>
  toast.add({ title, description: messageOf(error), type: "error" });

const without = (edits: Record<string, FloorplanDevice[]>, id: string) =>
  Object.fromEntries(Object.entries(edits).filter(([key]) => key !== id));

export const FloorplanView = ({
  data: initial,
  isLive,
}: {
  data: FloorplanData;
  isLive: boolean;
}) => {
  const queryClient = useQueryClient();
  const { data } = useFloorplan(initial, isLive);
  const [planId, setPlanId] = useState(
    () => (initial.plans.find((p) => p.hasImage) ?? initial.plans[0])?.id ?? "",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [edits, setEdits] = useState<Record<string, FloorplanDevice[]>>({});
  useFailureToast(
    "Some floor plan data did not load",
    data.failures.map((failure) => `${failure.serverName}: ${failure.message}`),
  );
  const plan = data.plans.find((p) => p.id === planId) ?? data.plans[0];
  const serverOnline = useServerOnline();
  const cameras = useMemo(() => {
    const online = new Map(
      data.servers.map((s) => [s.id, serverOnline(s, s.online)]),
    );
    return new Map(
      data.cameras.map((c): [string, PlanCamera] => [
        c.id,
        c.state === "disabled"
          ? c
          : { ...c, state: online.get(c.serverId) ? "live" : "server-offline" },
      ]),
    );
  }, [data.cameras, data.servers, serverOnline]);
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: FLOORPLAN_QUERY_KEY });
  const save = useMutation({
    mutationFn: async ({
      id,
      placements,
    }: {
      id: string;
      placements: FloorplanDevice[];
    }) => {
      if (isLive) await replacePlacementsRequest(id, placements);
    },
    onSuccess: (_result, { id, placements }) => {
      queryClient.setQueryData<FloorplanData>(
        FLOORPLAN_QUERY_KEY,
        (current) =>
          current && {
            ...current,
            placements: [
              ...current.placements.filter((p) => p.floorplanId !== id),
              ...placements,
            ],
          },
      );
      setEdits((all) => (all[id] === placements ? without(all, id) : all));
      if (isLive) void refresh();
    },
    onError: reportFailure("Could not save the placements"),
  });
  const { mutate: saveNow, isPending: saving } = save;
  const failed = useRef<Record<string, FloorplanDevice[]> | null>(null);
  useEffect(() => {
    const [id] = Object.keys(edits);
    if (!id || saving || failed.current === edits) return;
    const timer = setTimeout(
      () =>
        saveNow(
          { id, placements: edits[id] },
          {
            onError: () => {
              failed.current = edits;
            },
          },
        ),
      AUTOSAVE_MS,
    );
    return () => clearTimeout(timer);
  }, [edits, saving, saveNow]);
  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (isLive) await deleteFloorplanRequest(id);
    },
    onSuccess: async (_result, id) => {
      setEdits((all) => without(all, id));
      setSelectedId(null);
      await refresh();
    },
    onError: reportFailure("Could not delete the floor plan"),
  });
  const create = useMutation({
    mutationFn: createFloorplanRequest,
    onSuccess: async ({ id }) => {
      await refresh();
      setPlanId(id);
      setSelectedId(null);
      setCreating(false);
    },
  });
  const upload = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadImageRequest(id, file),
    onSuccess: refresh,
    onError: reportFailure("Could not upload the image"),
  });
  const createDialog = (
    <FloorplanFormDialog
      open={creating}
      groups={data.groups}
      plans={data.plans}
      initialGroupId={plan?.groupId ?? data.groups[0]?.id ?? ""}
      isPending={create.isPending}
      error={create.error ? messageOf(create.error) : null}
      onSave={(draft: FloorplanDraft) => create.mutate(draft)}
      onClose={() => {
        setCreating(false);
        create.reset();
      }}
    />
  );
  const canCreate = isLive && data.groups.length > 0;
  if (!plan)
    return (
      <PageShell>
        <SidePanel>
          <PanelSection title="Floor plan">
            {isLive && data.groups.length === 0 && (
              <PanelEmpty
                icon={<FolderIcon />}
                title="No groups yet"
                description="Create an edge server group first, a floor plan belongs to one."
              />
            )}
            <Button disabled={!canCreate} onClick={() => setCreating(true)}>
              <PlusIcon />
              Add floor plan
            </Button>
          </PanelSection>
        </SidePanel>
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
          <EmptyState
            icon={<LayersIcon />}
            title="No floor plans yet"
            description={
              canCreate
                ? "Add a floor plan to place cameras on it."
                : "Floor plans are added once an edge server group exists."
            }
          >
            {canCreate && (
              <Button onClick={() => setCreating(true)}>
                <PlusIcon />
                Add floor plan
              </Button>
            )}
          </EmptyState>
        </div>
        {createDialog}
      </PageShell>
    );
  const saved = data.placements.filter((p) => p.floorplanId === plan.id);
  const here = edits[plan.id] ?? saved;
  const edit = (change: (current: FloorplanDevice[]) => FloorplanDevice[]) =>
    setEdits((all) => ({ ...all, [plan.id]: change(all[plan.id] ?? saved) }));
  const scope = groupScope(data.groups, plan.groupId);
  const onPlan = new Set(here.map((p) => p.deviceRecordId));
  const unplaced = [...cameras.values()].filter(
    (c) =>
      !onPlan.has(c.id) &&
      (!isLive || (c.groupId !== null && scope.has(c.groupId))),
  );
  const selected = here.find((p) => p.id === selectedId) ?? null;
  const imageSrc =
    isLive && plan.hasImage
      ? `/api/floorplans/${plan.id}/image?v=${encodeURIComponent(plan.updatedAt ?? "")}`
      : null;
  return (
    <PageShell>
      <SidePanel>
        <FloorplanPanel
          plans={data.plans}
          planId={plan.id}
          onPlan={(id) => {
            setPlanId(id);
            setSelectedId(null);
            setOpenIds([]);
          }}
          here={here}
          unplaced={unplaced}
          cameras={cameras}
          selected={selected}
          query={query}
          onQuery={setQuery}
          onSelect={setSelectedId}
          onAdd={(deviceRecordId) => {
            const next = placeCamera(here, plan.id, deviceRecordId);
            edit(() => next);
            setSelectedId(next[next.length - 1].id);
          }}
          onRemove={(id) => {
            edit((all) => removeCamera(all, id));
            if (selectedId === id) setSelectedId(null);
            setOpenIds((all) => all.filter((open) => open !== id));
          }}
          onRotate={(id, degrees) =>
            edit((all) => rotateCamera(all, id, degrees))
          }
          onFov={(id, fov) => edit((all) => setFov(all, id, fov))}
          isLive={isLive}
          isBusy={upload.isPending || remove.isPending}
          hasImage={plan.hasImage}
          onCreate={() => setCreating(true)}
          onUpload={(file) => upload.mutate({ id: plan.id, file })}
          onDelete={() => setDeleting(true)}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:min-h-0">
        <PlanCanvas
          key={`${plan.id}-${imageSrc}`}
          plan={plan}
          imageSrc={imageSrc}
          rooms={data.rooms[plan.id] ?? []}
          placements={here}
          cameras={cameras}
          selectedId={selected?.id ?? null}
          openIds={openIds}
          onSelect={setSelectedId}
          onOpenChange={(id, open) =>
            setOpenIds((all) => [
              ...all.filter((openId) => openId !== id),
              ...(open ? [id] : []),
            ])
          }
          onMove={(id, x, y) => edit((all) => moveCamera(all, id, x, y))}
        />
      </div>
      {createDialog}
      <DeleteFloorplanDialog
        plan={plan}
        isOpen={deleting}
        hasChildren={data.plans.some((p) => p.parentId === plan.id)}
        onOpenChange={setDeleting}
        onConfirm={() => remove.mutate(plan.id)}
      />
    </PageShell>
  );
};

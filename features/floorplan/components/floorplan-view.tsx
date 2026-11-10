"use client";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { SidePanel } from "@/components/layout/side-panel";
import { FloorplanPanel } from "./floorplan-panel";
import { PlanCanvas } from "./plan-canvas";
import {
  moveCamera,
  placeCamera,
  removeCamera,
  rotateCamera,
  setFov,
} from "../lib/edit-placements";
import type { FloorplanData } from "../types";

export const FloorplanView = ({ data }: { data: FloorplanData }) => {
  const [placements, setPlacements] = useState(data.placements);
  const [planId, setPlanId] = useState(data.plans[0]?.id ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const plan = data.plans.find((p) => p.id === planId) ?? data.plans[0];
  const cameras = useMemo(
    () => new Map(data.cameras.map((c) => [c.id, c])),
    [data.cameras],
  );
  if (!plan)
    return (
      <p className="p-8 text-center text-xs text-muted-foreground">
        No floor plans yet.
      </p>
    );
  const here = placements.filter((p) => p.floorplanId === plan.id);
  const placedIds = new Set(placements.map((p) => p.deviceRecordId));
  const planName = new Map(data.plans.map((p) => [p.id, `${p.level}`]));
  const elsewhere = placements
    .filter((p) => p.floorplanId !== plan.id && cameras.get(p.deviceRecordId))
    .map((p) => ({
      camera: cameras.get(p.deviceRecordId)!,
      planName: `${data.plans.find((x) => x.id === p.floorplanId)?.building ?? ""} · ${planName.get(p.floorplanId) ?? ""}`,
    }));
  const unplaced = data.cameras.filter((c) => !placedIds.has(c.id));
  const selected = here.find((p) => p.id === selectedId) ?? null;
  return (
    <PageShell>
      <SidePanel>
        <FloorplanPanel
          plans={data.plans}
          planId={plan.id}
          onPlan={(id) => {
            setPlanId(id);
            setSelectedId(null);
          }}
          here={here}
          elsewhere={elsewhere}
          unplaced={unplaced}
          cameras={cameras}
          selected={selected}
          query={query}
          onQuery={setQuery}
          onSelect={setSelectedId}
          onAdd={(deviceRecordId) => {
            const next = placeCamera(placements, plan.id, deviceRecordId);
            setPlacements(next);
            setSelectedId(next[next.length - 1].id);
          }}
          onRemove={(id) => {
            setPlacements((all) => removeCamera(all, id));
            if (selectedId === id) setSelectedId(null);
          }}
          onRotate={(id, degrees) =>
            setPlacements((all) => rotateCamera(all, id, degrees))
          }
          onFov={(id, fov) => setPlacements((all) => setFov(all, id, fov))}
        />
      </SidePanel>
      <div className="flex min-w-0 flex-1 flex-col gap-4 bg-background p-4 lg:min-h-0">
        <PlanCanvas
          key={plan.id}
          plan={plan}
          rooms={data.rooms[plan.id] ?? []}
          placements={here}
          cameras={cameras}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          onMove={(id, x, y) =>
            setPlacements((all) => moveCamera(all, id, x, y))
          }
        />
      </div>
    </PageShell>
  );
};

import { ImageUpIcon, MapIcon, ScanEyeIcon } from "lucide-react";
import { useRef } from "react";
import {
  PanelDetail,
  PanelPicker,
  PanelSection,
  PanelSelected,
  PlacementAction,
} from "@/components/layout/side-panel";
import {
  DeviceTree,
  type DeviceTreeNode,
  matchesQuery,
} from "@/components/shared/device-tree";
import { Pick } from "@/components/shared/pick";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { isServerDown } from "@/lib/device-state";
import { FOV_OPTIONS } from "../lib/edit-placements";
import type { Floorplan, FloorplanDevice, PlanCamera } from "../types";

export const FloorplanPanel = ({
  plans,
  planId,
  onPlan,
  here,
  unplaced,
  cameras,
  selected,
  query,
  onQuery,
  onSelect,
  onAdd,
  onRemove,
  onRotate,
  onFov,
  isLive,
  isBusy,
  onCreate,
  onUpload,
  onDelete,
  hasImage,
}: {
  plans: Floorplan[];
  planId: string;
  onPlan: (id: string) => void;
  here: FloorplanDevice[];
  unplaced: PlanCamera[];
  cameras: Map<string, PlanCamera>;
  selected: FloorplanDevice | null;
  query: string;
  onQuery: (query: string) => void;
  onSelect: (id: string) => void;
  onAdd: (deviceRecordId: string) => void;
  onRemove: (id: string) => void;
  onRotate: (id: string, degrees: number) => void;
  onFov: (id: string, fov: number) => void;
  isLive: boolean;
  isBusy: boolean;
  hasImage: boolean;
  onCreate: () => void;
  onUpload: (file: File) => void;
  onDelete: () => void;
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const planItems = plans.map((p) => ({
    value: p.id,
    label: p.label,
  }));
  const fovItems = FOV_OPTIONS.map((fov) => ({
    value: String(fov),
    label: `${fov}°`,
  }));
  const selectedCamera = selected
    ? cameras.get(selected.deviceRecordId)
    : undefined;
  const matches = (camera: PlanCamera) =>
    matchesQuery(query, camera.name, camera.analytic, camera.serverName);
  const placementOf = new Map(here.map((p) => [p.deviceRecordId, p]));
  const shown = [
    ...here.flatMap((p) => cameras.get(p.deviceRecordId) ?? []),
    ...unplaced,
  ].filter(matches);
  const tree: DeviceTreeNode[] = [
    ...new Map(shown.map((c) => [c.serverId, c.serverName])),
  ].map(([serverId, serverName]) => {
    const own = shown.filter((c) => c.serverId === serverId);
    const onPlan = own.filter((c) => placementOf.has(c.id)).length;
    return {
      id: serverId,
      kind: "server",
      title: serverName,
      subtitle: `${onPlan}/${own.length} on this plan`,
      state: own.some((c) => !isServerDown(c.state)) ? "live" : own[0].state,
      children: own.map((camera) => {
        const placement = placementOf.get(camera.id);
        return {
          id: camera.id,
          kind: "device",
          title: camera.name,
          subtitle: camera.analytic ?? "No analytic",
          state: camera.state,
          isSelected: placement ? selected?.id === placement.id : false,
          isMuted: !placement,
          onSelect: placement ? () => onSelect(placement.id) : undefined,
          badge: camera.alerts > 0 && (
            <Badge variant="destructive" className="tabular-nums">
              {camera.alerts}
            </Badge>
          ),
          actions: (
            <PlacementAction
              isPlaced={!!placement}
              addLabel={`Add ${camera.name} to this plan`}
              removeLabel={`Remove ${camera.name} from this plan`}
              onClick={() =>
                placement ? onRemove(placement.id) : onAdd(camera.id)
              }
            />
          ),
        };
      }),
    };
  });
  return (
    <>
      <PanelPicker
        title="Floor plan"
        icon={MapIcon}
        items={planItems}
        value={planId}
        onChange={onPlan}
        actions={
          isLive
            ? {
                createLabel: "Add floor plan",
                deleteLabel: "Delete floor plan",
                isDeleteDisabled: isBusy,
                onCreate,
                onDelete,
              }
            : undefined
        }
      >
        {isLive && (
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              aria-label="Floor plan image"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onUpload(file);
              }}
            />
            <Button
              variant="secondary"
              disabled={isBusy}
              onClick={() => fileInput.current?.click()}
            >
              <ImageUpIcon />
              {hasImage ? "Replace image" : "Upload image"}
            </Button>
          </>
        )}
      </PanelPicker>
      {selected && selectedCamera && (
        <PanelSelected title={selectedCamera.name} state={selectedCamera.state}>
          <PanelDetail label="Edge server">
            {selectedCamera.serverName}
          </PanelDetail>
          <PanelDetail label="Analytic">
            {selectedCamera.analytic ?? "None"}
          </PanelDetail>
          <PanelDetail label="Alarms (24h)">
            {selectedCamera.alerts}
          </PanelDetail>
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Direction</span>
              <span className="font-medium tabular-nums">
                {selected.rotation}°
              </span>
            </div>
            <Slider
              aria-label="Direction"
              min={0}
              max={359}
              step={1}
              value={[selected.rotation]}
              onValueChange={(value) =>
                onRotate(selected.id, Array.isArray(value) ? value[0] : value)
              }
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Field of view</span>
            <Pick
              label="Field of view"
              icon={ScanEyeIcon}
              items={fovItems}
              value={String(selected.fieldOfView)}
              onChange={(fov) => onFov(selected.id, Number(fov))}
              className="w-full"
            />
          </div>
        </PanelSelected>
      )}
      <PanelSection title="Cameras">
        <DeviceTree
          nodes={tree}
          query={query}
          onQuery={onQuery}
          noun="cameras"
        />
      </PanelSection>
    </>
  );
};

import { CctvIcon, ImageUpIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useRef } from "react";
import {
  PanelActions,
  PanelDetail,
  PanelIconAction,
  PanelList,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FOV_OPTIONS } from "../lib/edit-placements";
import type { Floorplan, FloorplanDevice, PlanCamera } from "../types";

const STATE_LABEL = {
  live: "Live",
  disabled: "Disabled",
  "server-offline": "Server offline",
} as const;

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
  const needle = query.trim().toLowerCase();
  const matches = (camera: PlanCamera) =>
    !needle ||
    `${camera.name} ${camera.analytic ?? ""} ${camera.serverName}`
      .toLowerCase()
      .includes(needle);
  const hereShown = here.filter(
    (p) =>
      cameras.get(p.deviceRecordId) && matches(cameras.get(p.deviceRecordId)!),
  );
  const unplacedShown = unplaced.filter(matches);
  return (
    <>
      <PanelSection title="Floor plan">
        <Pick
          label="Floor plan"
          items={planItems}
          value={planId}
          onChange={onPlan}
          className="w-full"
        />
        {isLive && (
          <>
            <PanelActions
              createLabel="New floor plan"
              deleteLabel="Delete floor plan"
              isDeleteDisabled={isBusy}
              onCreate={onCreate}
              onDelete={onDelete}
            />
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
      </PanelSection>
      {selected && selectedCamera && (
        <section className="flex flex-col gap-2 rounded border p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">
              {selectedCamera.name}
            </span>
          </div>
          <PanelDetail label="Status">
            <StatusDot
              status={selectedCamera.state === "live" ? "live" : "offline"}
            />
            {STATE_LABEL[selectedCamera.state]}
          </PanelDetail>
          <PanelDetail label="Edge server">
            {selectedCamera.serverName}
          </PanelDetail>
          <PanelDetail label="Analytic">
            {selectedCamera.analytic ?? "None"}
          </PanelDetail>
          <PanelDetail label="Alerts (24h)">
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
              items={fovItems}
              value={String(selected.fieldOfView)}
              onChange={(fov) => onFov(selected.id, Number(fov))}
              className="w-full"
            />
          </div>
        </section>
      )}
      <PanelSection title="Cameras">
        <PanelSearch
          value={query}
          onChange={onQuery}
          placeholder="Search cameras..."
        />
        <PanelList
          title="On this plan"
          isEmpty={hereShown.length === 0}
          empty="No cameras on this plan"
          emptyIcon={<CctvIcon />}
        >
          {hereShown.map((placement) => {
            const camera = cameras.get(placement.deviceRecordId)!;
            return (
              <li key={placement.id} className="flex items-center gap-2 py-1">
                <StatusDot
                  status={camera.state === "live" ? "live" : "offline"}
                />
                <button
                  type="button"
                  aria-pressed={selected?.id === placement.id}
                  onClick={() => onSelect(placement.id)}
                  className="flex min-w-0 flex-1 flex-col text-left outline-none hover:underline focus-visible:underline"
                >
                  <span
                    className={
                      selected?.id === placement.id
                        ? "truncate text-xs font-medium"
                        : "truncate text-xs"
                    }
                  >
                    {camera.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {camera.analytic ?? "No analytic"}
                  </span>
                </button>
                {camera.alerts > 0 && (
                  <Badge variant="destructive" className="tabular-nums">
                    {camera.alerts}
                  </Badge>
                )}
                <PanelIconAction
                  label={`Remove ${camera.name} from this plan`}
                  onClick={() => onRemove(placement.id)}
                >
                  <MinusIcon />
                </PanelIconAction>
              </li>
            );
          })}
        </PanelList>
        <PanelList
          title="Not on this plan"
          isEmpty={unplacedShown.length === 0}
          empty="Every camera is on this plan"
          emptyIcon={<CctvIcon />}
        >
          {unplacedShown.map((camera) => (
            <li key={camera.id} className="flex items-center gap-2 py-1">
              <StatusDot
                status={camera.state === "live" ? "live" : "offline"}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs">{camera.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {camera.serverName}
                </span>
              </span>
              <PanelIconAction
                label={`Add ${camera.name} to this plan`}
                onClick={() => onAdd(camera.id)}
              >
                <PlusIcon />
              </PanelIconAction>
            </li>
          ))}
        </PanelList>
      </PanelSection>
    </>
  );
};

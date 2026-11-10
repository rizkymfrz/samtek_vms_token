import { MinusIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { Pick } from "@/components/shared/pick";
import { StatusDot } from "@/components/shared/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { FOV_OPTIONS } from "../lib/edit-placements";
import type { Floorplan, FloorplanDevice, PlanCamera } from "../types";

const STATE_LABEL = {
  live: "Live",
  disabled: "Disabled",
  "server-offline": "Server offline",
} as const;

const Detail = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 text-xs last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-right font-medium">
        {children}
      </span>
    </div>
  );
};

const IconAction = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export const FloorplanPanel = ({
  plans,
  planId,
  onPlan,
  here,
  elsewhere,
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
}: {
  plans: Floorplan[];
  planId: string;
  onPlan: (id: string) => void;
  here: FloorplanDevice[];
  elsewhere: { camera: PlanCamera; planName: string }[];
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
}) => {
  const planItems = plans.map((p) => ({
    value: p.id,
    label: `${p.building} · ${p.level}`,
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
  const elsewhereShown = elsewhere.filter((item) => matches(item.camera));
  return (
    <div className="flex flex-col gap-4 p-4">
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Floor plan
        </span>
        <Pick
          label="Floor plan"
          items={planItems}
          value={planId}
          onChange={onPlan}
          className="w-full"
        />
      </section>
      {selected && selectedCamera && (
        <section className="flex flex-col gap-2 border p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">
              {selectedCamera.name}
            </span>
            <IconAction
              label={`Remove ${selectedCamera.name} from this plan`}
              onClick={() => onRemove(selected.id)}
            >
              <Trash2Icon />
            </IconAction>
          </div>
          <Detail label="Status">
            <StatusDot
              status={selectedCamera.state === "live" ? "live" : "offline"}
            />
            {STATE_LABEL[selectedCamera.state]}
          </Detail>
          <Detail label="Edge server">{selectedCamera.serverName}</Detail>
          <Detail label="Analytic">{selectedCamera.analytic ?? "None"}</Detail>
          <Detail label="Alerts (24h)">{selectedCamera.alerts}</Detail>
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
              value={String(selected.fov)}
              onChange={(fov) => onFov(selected.id, Number(fov))}
              className="w-full"
            />
          </div>
        </section>
      )}
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Cameras
        </span>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search cameras..."
            aria-label="Search cameras"
            className="pl-8"
          />
        </div>
        <List
          title="On this plan"
          count={hereShown.length}
          empty="No cameras on this plan yet."
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
                <IconAction
                  label={`Remove ${camera.name} from this plan`}
                  onClick={() => onRemove(placement.id)}
                >
                  <MinusIcon />
                </IconAction>
              </li>
            );
          })}
        </List>
        <List
          title="Not placed"
          count={unplacedShown.length}
          empty="Every camera is on a plan."
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
              <IconAction
                label={`Add ${camera.name} to this plan`}
                onClick={() => onAdd(camera.id)}
              >
                <PlusIcon />
              </IconAction>
            </li>
          ))}
        </List>
        {elsewhereShown.length > 0 && (
          <List title="On other plans" count={elsewhereShown.length} empty="">
            {elsewhereShown.map(({ camera, planName }) => (
              <li
                key={camera.id}
                className="flex items-center gap-2 py-1 text-muted-foreground"
              >
                <StatusDot
                  status={camera.state === "live" ? "live" : "offline"}
                />
                <span className="min-w-0 flex-1 truncate text-xs">
                  {camera.name}
                </span>
                <span className="truncate text-xs">{planName}</span>
              </li>
            ))}
          </List>
        )}
      </section>
    </div>
  );
};

const List = ({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b py-2 text-xs">
        <span className="font-medium">{title}</span>
        <span className="text-muted-foreground tabular-nums">{count}</span>
      </div>
      {count === 0 ? (
        <p className="py-2 text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col">{children}</ul>
      )}
    </div>
  );
};

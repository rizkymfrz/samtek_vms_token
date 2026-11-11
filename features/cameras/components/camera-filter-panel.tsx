import { XIcon } from "lucide-react";
import {
  PanelField,
  PanelOption,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import { ANALYTICS } from "@/config/analytics-catalog";
import { ALL, type Filters, isFiltered } from "../lib/filter-cameras";
import type { ServerOption } from "../types";

const STATUS_ITEMS = [
  { value: ALL, label: "All statuses" },
  { value: "live", label: "Live" },
  { value: "disabled", label: "Disabled" },
  { value: "server-offline", label: "Server offline" },
];

const ANALYTIC_ITEMS = [
  { value: ALL, label: "All analytics" },
  { value: "none", label: "No analytic" },
  ...ANALYTICS.map((a) => ({ value: a.id, label: a.label })),
];

const RECORDING_ITEMS = [
  { value: ALL, label: "Recording: any" },
  { value: "on", label: "Recording on" },
  { value: "off", label: "Recording off" },
];

export const CameraFilterPanel = ({
  filters,
  servers,
  counts,
  onChange,
  onClear,
}: {
  filters: Filters;
  servers: ServerOption[];
  counts: Record<string, number>;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}) => {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const rows = [
    {
      id: ALL,
      name: "All servers",
      online: null as boolean | null,
      count: total,
    },
    ...servers.map((s) => ({
      id: s.id,
      name: s.name,
      online: s.online,
      count: counts[s.id] ?? 0,
    })),
  ];
  return (
    <>
      <PanelSection
        title="Filters"
        action={
          isFiltered(filters) && (
            <Button variant="ghost" onClick={onClear}>
              <XIcon />
              Clear
            </Button>
          )
        }
      >
        <PanelSearch
          value={filters.query}
          onChange={(query) => onChange({ query })}
          placeholder="Search cameras..."
        />
        <PanelField label="Status">
          <Pick
            label="Status"
            items={STATUS_ITEMS}
            value={filters.status}
            onChange={(status) => onChange({ status })}
            className="w-full"
          />
        </PanelField>
        <PanelField label="Analytic">
          <Pick
            label="Analytic"
            items={ANALYTIC_ITEMS}
            value={filters.analytic}
            onChange={(analytic) => onChange({ analytic })}
            className="w-full"
          />
        </PanelField>
        <PanelField label="Recording">
          <Pick
            label="Recording"
            items={RECORDING_ITEMS}
            value={filters.recording}
            onChange={(recording) => onChange({ recording })}
            className="w-full"
          />
        </PanelField>
      </PanelSection>
      <PanelSection title="Edge servers">
        <ul className="flex flex-col">
          {rows.map((row) => {
            const selected = filters.server === row.id;
            return (
              <li key={row.id}>
                <PanelOption
                  isSelected={selected}
                  onClick={() => onChange({ server: selected ? ALL : row.id })}
                >
                  {row.online !== null && (
                    <StatusDot status={row.online ? "live" : "offline"} />
                  )}
                  <span className="flex-1 truncate">{row.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {row.count}
                  </span>
                </PanelOption>
              </li>
            );
          })}
        </ul>
      </PanelSection>
    </>
  );
};

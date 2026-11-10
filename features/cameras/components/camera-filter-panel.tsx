import * as React from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ANALYTICS } from "@/config/analytics-catalog";
import { Pick } from "@/components/shared/pick";
import { StatusDot } from "@/components/shared/status-dot";
import type { ServerOption } from "../types";
import { ALL, isFiltered, type Filters } from "../lib/filter-cameras";

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

const FilterField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
};

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
    <div className="flex flex-col gap-4 p-4">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filters</span>
          {isFiltered(filters) && (
            <Button variant="ghost" size="xs" onClick={onClear}>
              <XIcon />
              Clear
            </Button>
          )}
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Search cameras..."
            aria-label="Search cameras"
            className="pl-8"
          />
        </div>
        <FilterField label="Status">
          <Pick
            label="Status"
            items={STATUS_ITEMS}
            value={filters.status}
            onChange={(status) => onChange({ status })}
            className="w-full"
          />
        </FilterField>
        <FilterField label="Analytic">
          <Pick
            label="Analytic"
            items={ANALYTIC_ITEMS}
            value={filters.analytic}
            onChange={(analytic) => onChange({ analytic })}
            className="w-full"
          />
        </FilterField>
        <FilterField label="Recording">
          <Pick
            label="Recording"
            items={RECORDING_ITEMS}
            value={filters.recording}
            onChange={(recording) => onChange({ recording })}
            className="w-full"
          />
        </FilterField>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Edge servers
        </span>
        <ul className="flex flex-col">
          {rows.map((row) => {
            const selected = filters.server === row.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ server: selected ? ALL : row.id })}
                  className={cn(
                    "flex w-full items-center gap-2 p-2 text-left text-xs outline-none hover:bg-accent focus-visible:bg-accent",
                    selected && "bg-accent font-medium",
                  )}
                >
                  {row.online !== null && (
                    <StatusDot status={row.online ? "live" : "offline"} />
                  )}
                  <span className="flex-1 truncate">{row.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {row.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

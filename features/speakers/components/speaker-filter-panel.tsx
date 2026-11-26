import { CircleDotIcon } from "lucide-react";
import {
  PanelField,
  PanelOption,
  PanelReset,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { ALL, type Filters, isFiltered } from "../lib/filter-speakers";
import type { ServerOption } from "../types";

const STATUS_ITEMS = [
  { value: ALL, label: "All statuses" },
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

export const SpeakerFilterPanel = ({
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
    { id: ALL, name: "All edge servers", count: total },
    ...servers.map((server) => ({
      id: server.id,
      name: server.name,
      count: counts[server.id] ?? 0,
    })),
  ];
  return (
    <>
      <PanelSection title="Filters">
        <PanelSearch
          value={filters.query}
          onChange={(query) => onChange({ query })}
          placeholder="Search speakers…"
        />
        <PanelField label="Status">
          <Pick
            label="Status"
            icon={CircleDotIcon}
            items={STATUS_ITEMS}
            value={filters.status}
            onChange={(status) => onChange({ status })}
            className="w-full"
          />
        </PanelField>
        <PanelReset isDisabled={!isFiltered(filters)} onClick={onClear} />
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

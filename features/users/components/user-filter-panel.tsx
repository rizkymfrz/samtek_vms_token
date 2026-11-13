import {
  PanelField,
  PanelOption,
  PanelReset,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { ALL, type Filters, isFiltered } from "../lib/filter-users";
import type { RoleOption } from "../types";

const STATUS_ITEMS = [
  { value: ALL, label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

export const UserFilterPanel = ({
  filters,
  roles,
  counts,
  onChange,
  onClear,
}: {
  filters: Filters;
  roles: RoleOption[];
  counts: Record<string, number>;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}) => {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const rows = [
    { id: ALL, name: "All roles", count: total },
    ...roles.map((role) => ({
      id: role.id,
      name: role.name,
      count: counts[role.id] ?? 0,
    })),
  ];
  return (
    <>
      <PanelSection title="Filters">
        <PanelSearch
          value={filters.query}
          onChange={(query) => onChange({ query })}
          placeholder="Search users..."
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
        <PanelReset isDisabled={!isFiltered(filters)} onClick={onClear} />
      </PanelSection>
      <PanelSection title="Roles">
        <ul className="flex flex-col">
          {rows.map((row) => {
            const selected = filters.role === row.id;
            return (
              <li key={row.id}>
                <PanelOption
                  isSelected={selected}
                  onClick={() => onChange({ role: selected ? ALL : row.id })}
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

import { Trash2Icon } from "lucide-react";
import {
  PanelField,
  PanelOption,
  PanelReset,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { ALL, type Filters, isFiltered } from "../lib/filter-persons";
import type { EdgeOption } from "../types";

export const FaceGroupPanel = ({
  filters,
  edges,
  groups,
  onChange,
  onClear,
  onDeleteGroup,
}: {
  filters: Filters;
  edges: EdgeOption[];
  groups: { group: string; count: number }[];
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  onDeleteGroup: (group: string) => void;
}) => {
  const total = groups.reduce((sum, item) => sum + item.count, 0);
  const edgeItems = [
    { value: ALL, label: "All edge servers" },
    ...edges.map((edge) => ({ value: edge.id, label: edge.name })),
  ];
  return (
    <>
      <PanelSection title="Filters">
        <PanelSearch
          value={filters.query}
          onChange={(query) => onChange({ query })}
          placeholder="Search people..."
        />
        {edges.length > 1 && (
          <PanelField label="Edge server">
            <Pick
              label="Edge server"
              items={edgeItems}
              value={filters.edge}
              onChange={(edge) => onChange({ edge })}
              className="w-full"
            />
          </PanelField>
        )}
        <PanelReset isDisabled={!isFiltered(filters)} onClick={onClear} />
      </PanelSection>
      <PanelSection title="Groups">
        <ul className="flex flex-col">
          {[{ group: ALL, count: total }, ...groups].map((item) => {
            const selected = filters.group === item.group;
            return (
              <li key={item.group}>
                <PanelOption
                  isSelected={selected}
                  onClick={() =>
                    onChange({ group: selected ? ALL : item.group })
                  }
                >
                  <span className="flex-1 truncate">
                    {item.group === ALL ? "All groups" : item.group}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.count}
                  </span>
                </PanelOption>
              </li>
            );
          })}
        </ul>
        {filters.group !== ALL && (
          <Button
            variant="destructive"
            onClick={() => onDeleteGroup(filters.group)}
          >
            <Trash2Icon />
            Delete group
          </Button>
        )}
      </PanelSection>
    </>
  );
};

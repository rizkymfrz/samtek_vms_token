import { XIcon } from "lucide-react";
import {
  PanelField,
  PanelOption,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { ALL, type Filters, isFiltered, RANGES } from "../lib/filter-alerts";

const RISK_ITEMS = [
  { value: ALL, label: "All risks" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
];

export const FilterPanel = ({
  filters,
  titles,
  cameras,
  onChange,
  onClear,
}: {
  filters: Filters;
  titles: string[];
  cameras: { camera: string; count: number }[];
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}) => {
  const titleItems = [
    { value: ALL, label: "All types" },
    ...titles.map((title) => ({ value: title, label: title })),
  ];
  const total = cameras.reduce((sum, item) => sum + item.count, 0);
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
          placeholder="Search alerts..."
        />
        <PanelField label="Time range">
          <Pick
            label="Time range"
            items={RANGES}
            value={filters.range}
            onChange={(range) => onChange({ range })}
            className="w-full"
          />
        </PanelField>
        <PanelField label="Risk">
          <Pick
            label="Risk"
            items={RISK_ITEMS}
            value={filters.risk}
            onChange={(risk) => onChange({ risk })}
            className="w-full"
          />
        </PanelField>
        <PanelField label="Type">
          <Pick
            label="Type"
            items={titleItems}
            value={filters.title}
            onChange={(title) => onChange({ title })}
            className="w-full"
          />
        </PanelField>
      </PanelSection>
      <PanelSection title="Cameras">
        <ul className="flex flex-col">
          {[{ camera: ALL, count: total }, ...cameras].map((item) => {
            const selected = filters.camera === item.camera;
            return (
              <li key={item.camera}>
                <PanelOption
                  isSelected={selected}
                  onClick={() =>
                    onChange({ camera: selected ? ALL : item.camera })
                  }
                >
                  <span className="flex-1 truncate">
                    {item.camera === ALL ? "All cameras" : item.camera}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.count}
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

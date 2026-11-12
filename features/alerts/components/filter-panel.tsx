import {
  PanelField,
  PanelOption,
  PanelReset,
  PanelSearch,
  PanelSection,
} from "@/components/layout/side-panel";
import { DatePicker } from "@/components/shared/date-picker";
import { Pick } from "@/components/shared/pick";
import {
  ALL,
  CUSTOM_RANGE,
  type Filters,
  isFiltered,
  parseDateKey,
  RANGES,
  toDateKey,
} from "../lib/filter-alerts";

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
  const fromDate = parseDateKey(filters.from);
  const toDate = parseDateKey(filters.to);
  const total = cameras.reduce((sum, item) => sum + item.count, 0);
  return (
    <>
      <PanelSection title="Filters">
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
        {filters.range === CUSTOM_RANGE && (
          <>
            <PanelField label="From">
              <DatePicker
                label="From date"
                value={fromDate}
                disabled={toDate && { after: toDate }}
                onChange={(date) => onChange({ from: toDateKey(date) })}
              />
            </PanelField>
            <PanelField label="To">
              <DatePicker
                label="To date"
                value={toDate}
                disabled={fromDate && { before: fromDate }}
                onChange={(date) => onChange({ to: toDateKey(date) })}
              />
            </PanelField>
          </>
        )}
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
        <PanelReset isDisabled={!isFiltered(filters)} onClick={onClear} />
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

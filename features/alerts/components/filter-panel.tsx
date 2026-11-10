import { SearchIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Pick } from "@/components/shared/pick";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ALL, type Filters, isFiltered, RANGES } from "../lib/filter-alerts";

const RISK_ITEMS = [
  { value: ALL, label: "All risks" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
];

const Field = ({ label, children }: { label: string; children: ReactNode }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
};

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
            placeholder="Search alerts..."
            aria-label="Search alerts"
            className="pl-8"
          />
        </div>
        <Field label="Time range">
          <Pick
            label="Time range"
            items={RANGES}
            value={filters.range}
            onChange={(range) => onChange({ range })}
            className="w-full"
          />
        </Field>
        <Field label="Risk">
          <Pick
            label="Risk"
            items={RISK_ITEMS}
            value={filters.risk}
            onChange={(risk) => onChange({ risk })}
            className="w-full"
          />
        </Field>
        <Field label="Type">
          <Pick
            label="Type"
            items={titleItems}
            value={filters.title}
            onChange={(title) => onChange({ title })}
            className="w-full"
          />
        </Field>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Cameras
        </span>
        <ul className="flex flex-col">
          {[{ camera: ALL, count: total }, ...cameras].map((item) => {
            const selected = filters.camera === item.camera;
            return (
              <li key={item.camera}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onChange({ camera: selected ? ALL : item.camera })
                  }
                  className={cn(
                    "flex w-full items-center justify-between gap-2 p-2 text-left text-xs outline-none hover:bg-accent focus-visible:bg-accent",
                    selected && "bg-accent font-medium",
                  )}
                >
                  <span className="truncate">
                    {item.camera === ALL ? "All cameras" : item.camera}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.count}
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

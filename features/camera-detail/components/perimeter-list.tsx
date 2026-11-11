import { MinusIcon, PentagonIcon, Trash2Icon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AreaShape, LineShape, Perimeters } from "@/lib/api/perimeters";
import { cn } from "@/lib/utils";
import type { Selection } from "../types";

type Row = {
  kind: "area" | "line";
  index: number;
  name: string;
};

export const PerimeterList = ({
  perimeters,
  selection,
  onSelect,
  onChangeLine,
  onChangeArea,
  onRemove,
}: {
  perimeters: Perimeters;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onChangeLine: (index: number, patch: Partial<LineShape>) => void;
  onChangeArea: (index: number, patch: Partial<AreaShape>) => void;
  onRemove: () => void;
}) => {
  const rows: Row[] = [
    ...perimeters.areas.map((area, index) => ({
      kind: "area" as const,
      index,
      name: area.name,
    })),
    ...perimeters.lines.map((line, index) => ({
      kind: "line" as const,
      index,
      name: line.name,
    })),
  ];
  if (rows.length === 0) {
    return (
      <p className="rounded border border-dashed p-4 text-center text-xs text-muted-foreground">
        No shapes yet. Pick Line or Polygon, then draw on the frame.
      </p>
    );
  }
  return (
    <ul className="flex flex-col overflow-hidden rounded border">
      {rows.map(({ kind, index, name }) => {
        const isSelected =
          selection?.kind === kind && selection.index === index;
        const Icon = kind === "line" ? MinusIcon : PentagonIcon;
        const line = kind === "line" ? perimeters.lines[index] : null;
        const area = kind === "area" ? perimeters.areas[index] : null;
        return (
          <li key={`${kind}-${index}`} className="border-b last:border-b-0">
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : { kind, index })}
              className={cn(
                buttonVariants({
                  variant: isSelected ? "default" : "secondary",
                }),
                "w-full justify-start rounded-none border-0 text-left",
              )}
            >
              <Icon />
              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                {name}
              </span>
            </button>
            {isSelected && (
              <div className="flex flex-col gap-4 p-2">
                <Field data-invalid={name.trim() === ""}>
                  <FieldLabel htmlFor="shape-name">Name</FieldLabel>
                  <Input
                    id="shape-name"
                    value={name}
                    aria-invalid={name.trim() === ""}
                    onChange={(event) =>
                      line
                        ? onChangeLine(index, { name: event.target.value })
                        : onChangeArea(index, { name: event.target.value })
                    }
                  />
                </Field>
                {line && (
                  <div className="grid grid-cols-2 gap-2">
                    <Field data-invalid={line.direction_a_name.trim() === ""}>
                      <FieldLabel htmlFor="shape-direction-a">
                        Direction A
                      </FieldLabel>
                      <Input
                        id="shape-direction-a"
                        value={line.direction_a_name}
                        aria-invalid={line.direction_a_name.trim() === ""}
                        onChange={(event) =>
                          onChangeLine(index, {
                            direction_a_name: event.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field data-invalid={line.direction_b_name.trim() === ""}>
                      <FieldLabel htmlFor="shape-direction-b">
                        Direction B
                      </FieldLabel>
                      <Input
                        id="shape-direction-b"
                        value={line.direction_b_name}
                        aria-invalid={line.direction_b_name.trim() === ""}
                        onChange={(event) =>
                          onChangeLine(index, {
                            direction_b_name: event.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                )}
                {area && (
                  <Field>
                    <FieldLabel htmlFor="shape-max-stay">
                      Max stay in seconds (optional)
                    </FieldLabel>
                    <Input
                      id="shape-max-stay"
                      type="number"
                      min={1}
                      step={1}
                      value={area.max_stay_seconds ?? ""}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        onChangeArea(index, {
                          max_stay_seconds:
                            event.target.value === ""
                              ? undefined
                              : Math.max(1, Math.floor(value)),
                        });
                      }}
                    />
                  </Field>
                )}
                <Button variant="destructive" onClick={onRemove}>
                  <Trash2Icon />
                  Delete {kind === "line" ? "line" : "area"}
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AreaShape, LineShape, Perimeters } from "@/lib/api/perimeters";
import type { Selection } from "../types";

export const PerimeterForm = ({
  perimeters,
  selection,
  onChangeLine,
  onChangeArea,
}: {
  perimeters: Perimeters;
  selection: Selection;
  onChangeLine: (index: number, patch: Partial<LineShape>) => void;
  onChangeArea: (index: number, patch: Partial<AreaShape>) => void;
}) => {
  const line =
    selection?.kind === "line" ? perimeters.lines[selection.index] : null;
  const area =
    selection?.kind === "area" ? perimeters.areas[selection.index] : null;
  if (!selection || (!line && !area)) return null;
  const name = (line ?? area)?.name ?? "";
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Field data-invalid={name.trim() === ""}>
        <FieldLabel htmlFor="shape-name">
          {line ? "Line crossing name" : "Area name"}
        </FieldLabel>
        <Input
          id="shape-name"
          value={name}
          aria-invalid={name.trim() === ""}
          onChange={(event) =>
            line
              ? onChangeLine(selection.index, { name: event.target.value })
              : onChangeArea(selection.index, { name: event.target.value })
          }
        />
      </Field>
      {line && (
        <>
          <Field data-invalid={line.direction_a_name.trim() === ""}>
            <FieldLabel htmlFor="shape-direction-a">
              Direction A name
            </FieldLabel>
            <Input
              id="shape-direction-a"
              value={line.direction_a_name}
              aria-invalid={line.direction_a_name.trim() === ""}
              onChange={(event) =>
                onChangeLine(selection.index, {
                  direction_a_name: event.target.value,
                })
              }
            />
          </Field>
          <Field data-invalid={line.direction_b_name.trim() === ""}>
            <FieldLabel htmlFor="shape-direction-b">
              Direction B name
            </FieldLabel>
            <Input
              id="shape-direction-b"
              value={line.direction_b_name}
              aria-invalid={line.direction_b_name.trim() === ""}
              onChange={(event) =>
                onChangeLine(selection.index, {
                  direction_b_name: event.target.value,
                })
              }
            />
          </Field>
        </>
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
            onChange={(event) =>
              onChangeArea(selection.index, {
                max_stay_seconds:
                  event.target.value === ""
                    ? undefined
                    : Math.max(1, Math.floor(Number(event.target.value))),
              })
            }
          />
        </Field>
      )}
    </div>
  );
};

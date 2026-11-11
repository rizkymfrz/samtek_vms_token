import { MinusIcon, PentagonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import type {
  AreaShape,
  LineShape,
  Perimeters,
  Point,
} from "@/lib/api/perimeters";
import { PerimeterCanvas } from "./perimeter-canvas";
import { PerimeterForm } from "./perimeter-form";
import { PerimeterList } from "./perimeter-list";
import { StreamFrame } from "./stream-frame";
import {
  addArea,
  addLine,
  canAddArea,
  canAddLine,
  hasDuplicateNames,
  movePoint,
  removeShape,
  updateArea,
  updateLine,
} from "../lib/edit-perimeters";
import type { CameraDetail, Selection, StreamState, Tool } from "../types";

export const PerimeterPanel = ({
  detail,
  state,
  perimeters,
  tool,
  selection,
  onToolChange,
  onSelect,
  onChange,
}: {
  detail: CameraDetail;
  state: StreamState;
  perimeters: Perimeters;
  tool: Tool;
  selection: Selection;
  onToolChange: (tool: Tool) => void;
  onSelect: (selection: Selection) => void;
  onChange: (perimeters: Perimeters) => void;
}) => {
  const pick = (next: Exclude<Tool, null>) => {
    onSelect(null);
    onToolChange(tool === next ? null : next);
  };
  const drawLine = (start: Point, end: Point) => {
    onChange(addLine(perimeters, start, end));
    onSelect({ kind: "line", index: perimeters.lines.length });
    onToolChange(null);
  };
  const drawArea = (polygon: Point[]) => {
    onChange(addArea(perimeters, polygon));
    onSelect({ kind: "area", index: perimeters.areas.length });
    onToolChange(null);
  };
  const changeLine = (index: number, patch: Partial<LineShape>) =>
    onChange(updateLine(perimeters, index, patch));
  const changeArea = (index: number, patch: Partial<AreaShape>) =>
    onChange(updateArea(perimeters, index, patch));
  const remove = (target: NonNullable<Selection>) => {
    onChange(removeShape(perimeters, target));
    if (selection?.kind !== target.kind) return;
    if (selection.index === target.index) onSelect(null);
    else if (selection.index > target.index) {
      onSelect({ kind: target.kind, index: selection.index - 1 });
    }
  };
  const isSelected =
    selection !== null &&
    (selection.kind === "line"
      ? perimeters.lines[selection.index] !== undefined
      : perimeters.areas[selection.index] !== undefined);
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Perimeter Setting</h2>
        <p className="text-xs text-muted-foreground">
          Draw the detection zones on the frame, then save your changes.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant={tool === "line" ? "default" : "secondary"}

          className="flex-1"
          aria-pressed={tool === "line"}
          disabled={!canAddLine(perimeters)}
          onClick={() => pick("line")}
        >
          <MinusIcon />
          Line
        </Button>
        <Button
          variant={tool === "polygon" ? "default" : "secondary"}

          className="flex-1"
          aria-pressed={tool === "polygon"}
          disabled={!canAddArea(perimeters)}
          onClick={() => pick("polygon")}
        >
          <PentagonIcon />
          Polygon
        </Button>
      </div>
      <PerimeterCanvas
        perimeters={perimeters}
        tool={tool}
        selection={selection}
        onSelect={onSelect}
        onAddLine={drawLine}
        onAddArea={drawArea}
        onMovePoint={(pointIndex, point) =>
          selection &&
          onChange(movePoint(perimeters, selection, pointIndex, point))
        }
      >
        <StreamFrame detail={detail} state={state} quality="sub" />
      </PerimeterCanvas>
      <div className="@container">
        <Card className="h-64 py-0 @xl:h-48">
          <div className="flex h-full min-h-0 flex-col @xl:flex-row">
            <PerimeterList
              perimeters={perimeters}
              selection={selection}
              onSelect={onSelect}
              onRemove={remove}
            />
            {isSelected && (
              <>
                <Separator className="@xl:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden @xl:block"
                />
                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4">
                  <PerimeterForm
                    perimeters={perimeters}
                    selection={selection}
                    onChangeLine={changeLine}
                    onChangeArea={changeArea}
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      {hasDuplicateNames(perimeters) && (
        <FieldError>Every line and area needs its own name.</FieldError>
      )}
    </section>
  );
};

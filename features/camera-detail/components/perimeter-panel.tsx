import { MinusIcon, PentagonIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import type {
  AreaShape,
  LineShape,
  Perimeters,
  Point,
} from "@/lib/api/perimeters";
import { PerimeterCanvas } from "./perimeter-canvas";
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
  error,
  onToolChange,
  onSelect,
  onChange,
}: {
  detail: CameraDetail;
  state: StreamState;
  perimeters: Perimeters;
  tool: Tool;
  selection: Selection;
  error: string | null;
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
  const remove = () => {
    if (!selection) return;
    onChange(removeShape(perimeters, selection));
    onSelect(null);
  };
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Perimeter Setting</h2>
        <p className="text-xs text-muted-foreground">
          Draw the detection zones on the frame, then save your changes.
        </p>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not save the perimeters</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
      <PerimeterList
        perimeters={perimeters}
        selection={selection}
        onSelect={onSelect}
        onChangeLine={changeLine}
        onChangeArea={changeArea}
        onRemove={remove}
      />
      {hasDuplicateNames(perimeters) && (
        <FieldError>Every line and area needs its own name.</FieldError>
      )}
    </section>
  );
};

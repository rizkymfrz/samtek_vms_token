import {
  MinusIcon,
  PentagonIcon,
  SquareDashedIcon,
  Trash2Icon,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Perimeters } from "@/lib/api/perimeters";
import { cn } from "@/lib/utils";
import type { Selection } from "../types";

type Kind = "area" | "line";

export const PerimeterList = ({
  perimeters,
  selection,
  onSelect,
  onRemove,
}: {
  perimeters: Perimeters;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  onRemove: (target: NonNullable<Selection>) => void;
}) => {
  const rows = [
    ...perimeters.areas.map((area, index) => ({
      kind: "area" as Kind,
      index,
      name: area.name,
    })),
    ...perimeters.lines.map((line, index) => ({
      kind: "line" as Kind,
      index,
      name: line.name,
    })),
  ];
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex h-18 shrink-0 items-center gap-2 px-4">
        <SquareDashedIcon className="size-4 text-muted-foreground" />
        <h3 className="flex-1 text-xs font-medium">Perimeters</h3>
      </div>
      <Separator />
      {rows.length === 0 ? (
        <EmptyState
          icon={<PentagonIcon />}
          title="No perimeters yet"
          description="Pick Line or Polygon, then draw on the frame."
          className="border-0 p-4 max-lg:py-4"
        />
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
          {rows.map(({ kind, index, name }) => {
            const isSelected =
              selection?.kind === kind && selection.index === index;
            const Icon = kind === "line" ? MinusIcon : PentagonIcon;
            return (
              <li
                key={`${kind}-${index}`}
                data-selected={isSelected}
                className={cn(
                  buttonVariants({
                    variant: isSelected ? "default" : "secondary",
                  }),
                  "group/row w-full justify-start gap-0 p-0",
                )}
              >
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(isSelected ? null : { kind, index })}
                  className="flex h-full min-w-0 flex-1 items-center gap-2 rounded px-2 text-left outline-none"
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate text-xs font-medium">{name}</span>
                </button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  aria-label={`Delete ${name}`}
                  title="Delete"
                  onClick={() => onRemove({ kind, index })}
                  className="mr-1 opacity-0 group-hover/row:opacity-100 group-data-[selected=true]/row:opacity-100 focus-visible:opacity-100"
                >
                  <Trash2Icon />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

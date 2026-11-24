import { isSameDay } from "date-fns";
import { useState } from "react";
import { PanelSection } from "@/components/layout/side-panel";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

export const PlaybackCalendar = ({
  applied,
  onApply,
}: {
  applied: Date;
  onApply: (day: Date) => void;
}) => {
  const [selected, setSelected] = useState<Date | undefined>(applied);
  const canApply = selected !== undefined && !isSameDay(selected, applied);
  return (
    <div className="mt-auto">
      <PanelSection title="Date">
        <div className="flex flex-col gap-2 rounded border bg-card p-2">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            defaultMonth={applied}
            className="bg-transparent"
            classNames={{ root: "w-full" }}
          />
          <div className="flex border-t pt-2">
            <Button
              className="flex-1"
              disabled={!canApply}
              onClick={() => selected && onApply(selected)}
            >
              Apply
            </Button>
          </div>
        </div>
      </PanelSection>
    </div>
  );
};

"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { type DateRange, getDefaultClassNames } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const formatDay = (date: Date) => format(date, "d MMM yyyy");

const describe = (range: DateRange | undefined) => {
  if (!range?.from) return "Pick a start and an end date.";
  if (!range.to || range.to.getTime() === range.from.getTime()) {
    return formatDay(range.from);
  }
  return `${formatDay(range.from)} – ${formatDay(range.to)}`;
};

const DateRangeForm = ({
  title,
  value,
  onApply,
  onClear,
}: {
  title: string;
  value: DateRange | undefined;
  onApply: (range: DateRange) => void;
  onClear: () => void;
}) => {
  const [draft, setDraft] = useState(value);
  return (
    <>
      <DialogHeader icon={CalendarIcon}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{describe(draft)}</DialogDescription>
      </DialogHeader>
      <Separator />
      <DialogBody>
        <DialogSection>
          <Calendar
            mode="range"
            numberOfMonths={2}
            classNames={{ root: cn(getDefaultClassNames().root, "w-full") }}
            selected={draft}
            defaultMonth={draft?.from}
            disabled={{ after: new Date() }}
            onSelect={setDraft}
          />
        </DialogSection>
      </DialogBody>
      <Separator />
      <DialogFooter>
        <Button variant="secondary" onClick={onClear}>
          Clear
        </Button>
        <Button
          disabled={!draft?.from}
          onClick={() =>
            draft?.from &&
            onApply({ from: draft.from, to: draft.to ?? draft.from })
          }
        >
          Apply
        </Button>
      </DialogFooter>
    </>
  );
};

export const DateRangeDialog = ({
  open,
  onOpenChange,
  title = "Select date range",
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DateRangeForm
          title={title}
          value={value}
          onApply={(range) => {
            onChange(range);
            onOpenChange(false);
          }}
          onClear={() => {
            onChange(undefined);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

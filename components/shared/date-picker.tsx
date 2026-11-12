"use client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { Matcher } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const DatePicker = ({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
}: {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: Matcher | Matcher[];
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="secondary"
            aria-label={label}
            className={cn("w-full justify-start", className)}
          />
        }
      >
        <CalendarIcon />
        {value ? (
          format(value, "d MMM yyyy")
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          disabled={disabled}
          onSelect={(date) => {
            onChange(date);
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

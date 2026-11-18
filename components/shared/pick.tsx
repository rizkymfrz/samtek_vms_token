"use client";
import type { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type PickItem = { value: string; label: string };

export const Pick = ({
  label,
  icon,
  items,
  value,
  onChange,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  items: PickItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onChange(String(next))}
    >
      <SelectTrigger
        icon={icon}
        className={cn(icon ? "w-36" : "w-32", className)}
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

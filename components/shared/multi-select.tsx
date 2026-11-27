"use client";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Add…",
  format = (item) => item,
  className,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  format?: (item: string) => string;
  className?: string;
}) => {
  const anchor = useComboboxAnchor();
  return (
    <Combobox
      multiple
      items={options}
      itemToStringLabel={format}
      value={value}
      onValueChange={(next) => onChange(next)}
    >
      <ComboboxChips ref={anchor} className={cn("w-full", className)}>
        <ComboboxValue>
          {(selected: string[]) => (
            <>
              {selected.map((item) => (
                <ComboboxChip key={item}>{format(item)}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={placeholder} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {format(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

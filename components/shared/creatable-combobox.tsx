"use client";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const TYPED_REASONS = new Set(["input-change", "item-press", "clear-press"]);

export const CreatableCombobox = ({
  id,
  options,
  value,
  onChange,
  placeholder,
  maxLength,
  emptyLabel = (typed) => `Use "${typed}"`,
  "aria-invalid": ariaInvalid,
}: {
  id?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  emptyLabel?: (typed: string) => string;
  "aria-invalid"?: boolean;
}) => {
  return (
    <Combobox
      items={options}
      value={options.includes(value) ? value : null}
      inputValue={value}
      onInputValueChange={(next, details) => {
        if (TYPED_REASONS.has(details.reason)) onChange(next);
      }}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={ariaInvalid}
        autoComplete="off"
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyLabel(value.trim())}</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

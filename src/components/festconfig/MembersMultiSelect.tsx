"use client";

import { MultiSelect } from "@/components/ui/multi-select";
import type { OptionItem } from "./types";

interface MembersMultiSelectProps {
  options: OptionItem[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

export function MembersMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select members...",
  required = false,
}: MembersMultiSelectProps) {
  const getLabelForValue = (value: string) =>
    options.find((o) => o.value === value)?.label;
  return (
    <MultiSelect
      options={options}
      selected={selected}
      onChange={onChange}
      placeholder={placeholder}
      getLabelForValue={getLabelForValue}
      required={required}
    />
  );
}

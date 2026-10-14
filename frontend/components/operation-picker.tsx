"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Operation } from "@/lib/api";
import { groupOperationsByModule } from "@/lib/operations-ui";

type OperationPickerProps = {
  id: string;
  label: string;
  operations: readonly Operation[];
  value: string;
  onChange: (operationId: string) => void;
};

export function OperationPicker({ id, label, operations, value, onChange }: OperationPickerProps) {
  const groups = groupOperationsByModule(operations);
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span id={`${id}-label`} className="font-medium text-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} aria-labelledby={`${id}-label`}>
          <SelectValue placeholder="Choose an operation" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group, groupIndex) => (
            <SelectGroup key={group.module}>
              {groupIndex > 0 ? <SelectSeparator /> : null}
              <SelectLabel>{group.label}</SelectLabel>
              {group.items.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
